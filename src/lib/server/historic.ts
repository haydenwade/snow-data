import { HistoricDay } from "@/types/historic";
import { fetchAwdbJson, parseAwdbDate, toIsoDate } from "./awdb";

type DailyRecord = {
  date: string;
  snowDepthAtStartOfDay: number | null;
  sourceElement?: "SNWD" | "WTEQ" | null;
};

type StationDataResponse = Array<{
  data?: Array<{
    stationElement?: { elementCode?: string };
    elementCd?: string;
    elementCode?: string;
    values?: Array<{ date: unknown; value: unknown }>;
  }>;
}>;

function shiftIsoDate(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeDate(input: unknown): string | null {
  const parsed = parseAwdbDate(input);
  if (!parsed) return null;
  const match = parsed.match(/\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const dt = new Date(parsed);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
}

export async function fetchHistoricByStationTriplet({
  stationTriplet,
  days = 30,
  beginDate,
  endDate,
}: {
  stationTriplet: string;
  days?: number;
  beginDate?: string | null;
  endDate?: string | null;
}): Promise<HistoricDay[]> {
  const end = endDate ?? toIsoDate(new Date());
  const safeDays = Math.min(30, Math.max(1, days));
  const begin =
    beginDate ??
    (() => {
      const date = new Date(end);
      date.setDate(date.getDate() - (safeDays - 1));
      return toIsoDate(date);
    })();

  const json = await fetchAwdbJson<StationDataResponse>("/data", {
    stationTriplets: stationTriplet,
    elements: "SNWD,WTEQ",
    duration: "DAILY",
    beginDate: begin,
    endDate: end,
    unitSystem: "ENGLISH",
  });

  const stations = Array.isArray(json) ? json : [];
  const byDate = new Map<string, DailyRecord>();

  const pushValue = (elementCode: string, dateLike: unknown, value: unknown) => {
    const isoDate = normalizeDate(dateLike);
    if (!isoDate) return;

    const existing = byDate.get(isoDate) ?? {
      date: isoDate,
      snowDepthAtStartOfDay: null,
      sourceElement: null,
    };

    const numeric =
      value == null || value === "" ? null : Number(value);

    if (elementCode === "SNWD") {
      existing.snowDepthAtStartOfDay = Number.isFinite(numeric as number)
        ? (numeric as number)
        : null;
      existing.sourceElement = "SNWD";
    } else if (elementCode === "WTEQ" && existing.snowDepthAtStartOfDay == null) {
      existing.snowDepthAtStartOfDay = Number.isFinite(numeric as number)
        ? (numeric as number) / 0.25
        : null;
      existing.sourceElement = "WTEQ";
    }

    byDate.set(isoDate, existing);
  };

  for (const station of stations) {
    for (const elementRecord of station.data ?? []) {
      const elementCode = String(
        elementRecord.stationElement?.elementCode ??
          elementRecord.elementCd ??
          elementRecord.elementCode ??
          "",
      ).toUpperCase();

      for (const valueRecord of elementRecord.values ?? []) {
        pushValue(elementCode, valueRecord.date, valueRecord.value);
      }
    }
  }

  const dates = Array.from(byDate.keys()).sort();
  const out: HistoricDay[] = [];

  for (let idx = 0; idx < dates.length; idx += 1) {
    const date = dates[idx];
    if (!date) continue;

    const current = byDate.get(date);
    if (!current) continue;

    const nextDate = idx + 1 < dates.length ? dates[idx + 1] : null;
    const next = nextDate ? byDate.get(nextDate) : null;

    let derivedSnowfall: number | null = null;
    if (
      next &&
      current.snowDepthAtStartOfDay != null &&
      next.snowDepthAtStartOfDay != null &&
      current.sourceElement != null &&
      current.sourceElement === next.sourceElement
    ) {
      const diff = next.snowDepthAtStartOfDay - current.snowDepthAtStartOfDay;
      derivedSnowfall = diff > 0 ? diff : 0;
    }

    out.push({
      date: shiftIsoDate(current.date, 1),
      snowDepthAtStartOfDay: current.snowDepthAtStartOfDay,
      derivedSnowfall,
      depthSource: current.sourceElement,
    });
  }

  return out;
}
