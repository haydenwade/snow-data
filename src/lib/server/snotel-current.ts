import SunCalc from "suncalc";
import { ApiResp, TimeseriesPoint } from "@/types/current-conditions-response";
import { awdbDateToIso, fetchAwdbJson } from "./awdb";
import { AwdbStation, inferTimeZone } from "./stations";
import { MountainLocation } from "@/types/location";

type StationDataResponse = Array<{
  data?: Array<{
    stationElement?: { elementCode?: string };
    elementCd?: string;
    elementCode?: string;
    values?: Array<{ date?: string; value?: number | null }>;
  }>;
}>;

type SnotelCurrentResponse = ApiResp & {
  lastUpdatedAt: string | null;
};

function getTimeZoneOffsetAt(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(date);
  const n = (type: string) => Number(parts.find((part) => part.type === type)?.value);

  const asUtc = Date.UTC(
    n("year"),
    n("month") - 1,
    n("day"),
    n("hour"),
    n("minute"),
    n("second"),
  );

  return (asUtc - date.getTime()) / 60000;
}

function getMidnightInZone(date: Date, timeZone: string): Date {
  const ymd = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(ymd.find((p) => p.type === "year")?.value);
  const month = Number(ymd.find((p) => p.type === "month")?.value);
  const day = Number(ymd.find((p) => p.type === "day")?.value);

  const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offsetMinutes = getTimeZoneOffsetAt(new Date(utcMidnight), timeZone);
  return new Date(utcMidnight - offsetMinutes * 60_000);
}

function getSunTimes({
  lat,
  lon,
  date,
  timeZone,
}: {
  lat: number;
  lon: number;
  date: Date;
  timeZone: string;
}) {
  const base = getMidnightInZone(date, timeZone);
  const times = SunCalc.getTimes(base, lat, lon);
  return {
    sunrise: times.sunrise ? times.sunrise.toISOString() : null,
    sunset: times.sunset ? times.sunset.toISOString() : null,
  };
}

function minutesSince(iso?: string | null): number | null {
  if (!iso) return null;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
}

function windLabel(mph?: number | null) {
  if (mph == null || Number.isNaN(mph)) return "Calm";
  const speed = Math.abs(mph);
  if (speed < 1) return "Calm";
  if (speed < 6) return "Light";
  if (speed < 15) return "Moderate";
  if (speed < 25) return "Blustery";
  if (speed < 40) return "Strong";
  return "Gale";
}

function degToCardinal(deg?: number | null): string | null {
  if (deg == null || Number.isNaN(deg)) return null;
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const normalized = ((deg % 360) + 360) % 360;
  const idx = Math.round(normalized / 22.5) % 16;
  return dirs[idx] ?? null;
}

function windArrowRotation(deg?: number | null): number | null {
  if (deg == null || Number.isNaN(deg)) return null;
  return ((deg % 360) + 360) % 360;
}

function numberOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toDateLabel(iso: string, timeZone: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      timeZone,
      hour: "numeric",
    });
  } catch {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric" });
  }
}

function latestValueAtOrBefore(
  points: Array<{ ts: string; value: number | null }>,
  targetTs: string,
) {
  for (let idx = points.length - 1; idx >= 0; idx -= 1) {
    const point = points[idx];
    if (!point || point.value == null) continue;
    if (point.ts <= targetTs) return point.value;
  }
  return null;
}

function toSeriesMap(
  stationData: StationDataResponse,
  offsetHours: number | null | undefined,
) {
  const byElement = new Map<string, Array<{ ts: string; value: number | null }>>();

  for (const station of stationData) {
    for (const dataRecord of station.data ?? []) {
      const elementCode = String(
        dataRecord.stationElement?.elementCode ??
          dataRecord.elementCd ??
          dataRecord.elementCode ??
          "",
      ).toUpperCase();
      if (!elementCode) continue;

      const points = (dataRecord.values ?? [])
        .map((valueRecord) => {
          const parsed = awdbDateToIso(String(valueRecord.date ?? ""), offsetHours);
          if (!parsed) return null;
          return {
            ts: parsed,
            value: numberOrNull(valueRecord.value),
          };
        })
        .filter((value): value is { ts: string; value: number | null } => Boolean(value))
        .sort((a, b) => a.ts.localeCompare(b.ts));

      if (points.length === 0) continue;
      byElement.set(elementCode, points);
    }
  }

  return byElement;
}

function pickTimelineTimestamps(
  byElement: Map<string, Array<{ ts: string; value: number | null }>>,
) {
  const preferred = ["TOBS", "SNWD", "WTEQ", "PRCP", "PREC", "WSPDV", "WSPD"];

  for (const element of preferred) {
    const points = byElement.get(element);
    if (!points?.length) continue;
    return points.slice(-24).map((point) => point.ts);
  }

  const all = new Set<string>();
  byElement.forEach((points) => points.forEach((point) => all.add(point.ts)));
  return Array.from(all).sort().slice(-24);
}

function buildTimeseries(
  byElement: Map<string, Array<{ ts: string; value: number | null }>>,
  timeZone: string,
): TimeseriesPoint[] {
  const timestamps = pickTimelineTimestamps(byElement);

  return timestamps.map((timestamp) => {
    const temperatureF = latestValueAtOrBefore(byElement.get("TOBS") ?? [], timestamp);
    const windSpeedMph =
      latestValueAtOrBefore(byElement.get("WSPDV") ?? [], timestamp) ??
      latestValueAtOrBefore(byElement.get("WSPD") ?? [], timestamp);
    const windDirectionDeg =
      latestValueAtOrBefore(byElement.get("WDIRV") ?? [], timestamp) ??
      latestValueAtOrBefore(byElement.get("WDIR") ?? [], timestamp);

    return {
      startTime: timestamp,
      hourLabel: toDateLabel(timestamp, timeZone),
      temperatureF:
        temperatureF == null ? null : Math.round(temperatureF),
      precipChancePct: null,
      wind: {
        speedMph:
          windSpeedMph == null ? null : Math.round(windSpeedMph),
        directionText: degToCardinal(windDirectionDeg),
        label: windLabel(windSpeedMph),
      },
      sky: null,
    };
  });
}

export async function fetchSnotelCurrentConditions({
  station,
  locationMatch,
}: {
  station: AwdbStation;
  locationMatch: MountainLocation | null;
}): Promise<SnotelCurrentResponse> {
  const hourlyData = await fetchAwdbJson<StationDataResponse>("/data", {
    stationTriplets: station.stationTriplet,
    elements: "TOBS,SNWD,WTEQ,PRCP,PREC,WSPDV,WSPD,WDIRV,WDIR,RHUMV,RHUM",
    duration: "HOURLY",
    beginDate: -48,
    endDate: 0,
    unitSystem: "ENGLISH",
  });

  const tz = inferTimeZone(station, locationMatch);
  const byElement = toSeriesMap(hourlyData, station.dataTimeZone ?? null);
  const timeseriesData = buildTimeseries(byElement, tz);
  const latest = timeseriesData.at(-1) ?? null;
  const observedAt = latest?.startTime ?? null;
  const ageMin = minutesSince(observedAt);
  const snowDepth =
    observedAt == null
      ? null
      : latestValueAtOrBefore(byElement.get("SNWD") ?? [], observedAt);
  const prcpIncrement =
    observedAt == null
      ? null
      : latestValueAtOrBefore(byElement.get("PRCP") ?? [], observedAt);

  const conditionText =
    prcpIncrement != null && prcpIncrement > 0
      ? "Precipitation Detected"
      : observedAt
      ? "SNOTEL Observation"
      : "Conditions Unavailable";

  return {
    currentData: {
      locationId: station.stationId,
      stationId: station.stationId,
      source: "observation",
      observedAt,
      ageMin,
      isObserved: true,
      isObservationStale: ageMin == null ? null : ageMin > 180,
      temperatureF: latest?.temperatureF ?? null,
      conditionText,
      wind: {
        speedMph: latest?.wind?.speedMph ?? null,
        directionDeg:
          observedAt == null
            ? null
            : latestValueAtOrBefore(byElement.get("WDIRV") ?? [], observedAt) ??
              latestValueAtOrBefore(byElement.get("WDIR") ?? [], observedAt),
        directionText: latest?.wind?.directionText ?? null,
        arrowRotation: windArrowRotation(
          observedAt == null
            ? null
            : latestValueAtOrBefore(byElement.get("WDIRV") ?? [], observedAt) ??
                latestValueAtOrBefore(byElement.get("WDIR") ?? [], observedAt),
        ),
        label: windLabel(latest?.wind?.speedMph ?? null),
      },
      sun: {
        ...getSunTimes({
          lat: station.latitude ?? locationMatch?.lat ?? 0,
          lon: station.longitude ?? locationMatch?.lon ?? 0,
          date: new Date(),
          timeZone: tz,
        }),
        timeZone: tz,
      },
    },
    timeseriesData,
    lastUpdatedAt: observedAt ?? (snowDepth != null ? new Date().toISOString() : null),
  };
}
