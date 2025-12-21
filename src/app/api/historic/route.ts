import { HistoricDay } from "@/components/snow-report/utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Replace HTML scraping with USDA AWDB JSON API for SNOTEL daily series.
// Returns merged daily records by date for WTEQ (SWE), SNWD (snow depth), and PREC (precipitation).

type DailyRecord = {
  date: string; // YYYY-MM-DD
  snowDepthAtStartOfDay: number | null; // SNWD in inches
};

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  request: Request
): Promise<NextResponse<GetResponseType>> {
  const { searchParams } = new URL(request.url);
  // Allow custom range via query; default to last 30 days through today.
  // Some stations may not have published today's daily value yet; that's fine—AWDB will return what exists.
  const endParam = searchParams.get("endDate");
  const today = new Date();
  const end = endParam || toISODate(today);
  const days = Math.min(
    30,
    Math.max(1, Number(searchParams.get("days") || 30))
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
  const stationTriplet = "1308:UT:SNTL";
  const elements = "SNWD";
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
        "User-Agent":
          "AltaSnowReport/1.0 (snow-data dev; contact: support@alta-snow.local)", //TODO update contact info
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
        { status: 500 }
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
      };
      const num = value == null || value === "" ? null : Number(value);
      if (el === "SNWD")
        rec.snowDepthAtStartOfDay = Number.isFinite(num as number)
          ? (num as number)
          : null;
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
            (v as any).value
          );
        }
      }
    }

    const dates = Array.from(byDate.keys()).sort();
    // Attribute derived snowfall to the day it occurred: compute nextStart - curStart
    const out = dates.map((d, idx) => {
      const rec = byDate.get(d)!;
      const next = idx < dates.length - 1 ? byDate.get(dates[idx + 1]) : undefined;
      let derived = 0;
      if (
        next &&
        rec.snowDepthAtStartOfDay != null &&
        next.snowDepthAtStartOfDay != null
      ) {
        const dd = next.snowDepthAtStartOfDay - rec.snowDepthAtStartOfDay;
        if (dd > 0) derived = dd;
      }
      return {
        date: rec.date,
        snowDepthAtStartOfDay: rec.snowDepthAtStartOfDay ?? null,
        derivedSnowfall: Number(Math.max(0, derived).toFixed(2)),
      };
    });

    return NextResponse.json({ data: out }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
