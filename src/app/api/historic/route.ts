import { LOCATIONS } from "@/constants/locations";
import { HistoricDay } from "@/types/historic";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Replace HTML scraping with USDA AWDB JSON API for SNOTEL daily series.
// Returns merged daily records by date for WTEQ (SWE), SNWD (snow depth), and PREC (precipitation).

type DailyRecord = {
  date: string; // YYYY-MM-DD
  snowDepthAtStartOfDay: number | null; // SNWD in inches
  sourceElement?: "SNWD" | "WTEQ" | null;
};

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Shift a YYYY-MM-DD date string by N days (UTC-safe for our usage)
function shiftISO(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Normalize various date formats from AWDB values to YYYY-MM-DD
function normalizeDate(input: any): string | null {
  if (typeof input === "string") {
    const m = input.match(/\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
    const dt = new Date(input);
    if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
    return null;
  }
  if (typeof input === "number") {
    const dt = new Date(input);
    if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
    return null;
  }
  if (input && typeof input === "object") {
    const candidate =
      (input as any).date ||
      (input as any).Date ||
      (input as any).validDate ||
      (input as any).obsDate ||
      (input as any).beginDate ||
      (input as any).endDate;
    return normalizeDate(candidate);
  }
  return null;
}

interface GetResponseType {
  error?: string;
  detail?: string;
  data?: HistoricDay[];
}

export async function GET(
  request: Request,
): Promise<NextResponse<GetResponseType>> {
  const { searchParams } = new URL(request.url);
  // Always return dates aligned to the station's local "start of day" label.
  // The AWDB DAILY JSON labels SNWD one calendar day earlier than the UI's
  // "Start of Day" table, so we normalize by shifting +1 day consistently.

  const locationId = searchParams.get("locationId");
  const location = LOCATIONS.find((l) => l.id === locationId);
  if (!location) {
    return NextResponse.json(
      { error: "No location found matching locationId" },
      { status: 404 },
    );
  }

  // Allow custom range via query; default to last 30 days through today.
  // Some stations may not have published today's daily value yet; that's fine—AWDB will return what exists.
  const endParam = searchParams.get("endDate");
  const today = new Date();
  const end = endParam || toISODate(today);
  const days = Math.min(
    30,
    Math.max(1, Number(searchParams.get("days") || 30)),
  );
  const begin =
    searchParams.get("beginDate") ||
    (() => {
      const d = new Date(end);
      d.setDate(d.getDate() - (days - 1));
      return toISODate(d);
    })();

  // AWDB endpoint pieces
  const BASE = "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data";
  const stationTriplet = location.stationTriplet; // e.g., "1308:SNTL:UT"
  // Some stations (e.g., MSNT/Cooperator) may not publish SNWD but do publish WTEQ.
  // Request both and prefer SNWD; fall back to WTEQ so historic table is not empty.
  const elements = "SNWD,WTEQ";
  const duration = "DAILY";
  const unitSystem = "ENGLISH";

  const params = new URLSearchParams({
    stationTriplets: stationTriplet,
    elements,
    duration,
    beginDate: begin,
    endDate: end,
    unitSystem,
  });

  const url = `${BASE}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "snowd.app/1.0 (snow-data dev;)", //TODO update contact info
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: `AWDB fetch failed: ${res.status}`,
          detail: body.slice(0, 1000),
        },
        { status: 500 },
      );
    }

    const json = await res.json();

    // The AWDB response for this endpoint is an array with one item per station.
    // Each item has a `data` array containing one object per element with a `values` array.
    const stations: Array<{
      data?: Array<{
        stationElement?: { elementCode?: string };
        elementCd?: string;
        elementCode?: string;
        values?: Array<{ date: any; value: any }>;
      }>;
    }> = Array.isArray(json) ? json : json?.data ? [json] : [];

    // Build a date-indexed map
    const byDate = new Map<string, DailyRecord>();

    const pushValue = (el: string, dateLike: any, value: any) => {
      const iso = normalizeDate(dateLike);
      if (!iso) return; // skip malformed dates
      const rec = byDate.get(iso) || {
        date: iso,
        // SNWD -> snowDepthAtStartOfDay (in inches)
        snowDepthAtStartOfDay: null,
        sourceElement: null,
      };
      const num = value == null || value === "" ? null : Number(value);
      if (el === "SNWD") {
        rec.snowDepthAtStartOfDay = Number.isFinite(num as number)
          ? (num as number)
          : null;
        rec.sourceElement = "SNWD";
      }
      // Fallback only when SNWD is not available for that date.
      else if (el === "WTEQ" && rec.snowDepthAtStartOfDay == null) {
        // Estimate snow depth from SWE using bulk density assumption:
        // Depth ≈ WTEQ / 0.25 - 25% is based on sierra snowpack
        rec.snowDepthAtStartOfDay = Number.isFinite(num as number)
          ? (num as number) / 0.25
          : null;
        rec.sourceElement = "WTEQ";
      }
      byDate.set(iso, rec);
    };

    // Walk station -> element -> values and merge by date
    for (const station of stations) {
      const elems = station?.data || [];
      for (const e of elems) {
        const el =
          e?.stationElement?.elementCode ||
          (e as any).elementCd ||
          (e as any).elementCode ||
          (e as any).element ||
          "";
        const values = e?.values || [];
        for (const v of values) {
          pushValue(
            String(el).toUpperCase(),
            (v as any).date,
            (v as any).value,
          );
        }
      }
    }

    const dates = Array.from(byDate.keys()).sort();
    // Attribute derived snowfall to the day it occurred: compute nextStart - curStart.
    // USDA "data" service dates for DAILY SNWD appear to be labeled one day earlier than
    // the "Start of Day" dates shown in the ReportGenerator UI. To align with the UI and
    // common expectation, we shift the output date forward by +1 day.
    const out: HistoricDay[] = [];
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const rec = byDate.get(date)!;
      const nextDay = i + 1 < dates.length ? byDate.get(dates[i + 1]!) : null;
      let derivedSnowfall: number | null = null;
      if (
        nextDay &&
        rec.snowDepthAtStartOfDay != null &&
        nextDay.snowDepthAtStartOfDay != null &&
        rec.sourceElement != null &&
        rec.sourceElement === nextDay.sourceElement
      ) {
        const diff = nextDay.snowDepthAtStartOfDay - rec.snowDepthAtStartOfDay;
        derivedSnowfall = diff > 0 ? diff : 0;
      }
      out.push({
        // Align to UI/local reporting day boundary by shifting dates +1 day
        // (AWDB DAILY label -> local Start-of-Day label)
        date: shiftISO(rec.date, 1),
        snowDepthAtStartOfDay: rec.snowDepthAtStartOfDay,
        derivedSnowfall,
        depthSource: rec.sourceElement,
      });
    }

    return NextResponse.json({ data: out }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 },
    );
  }
}
