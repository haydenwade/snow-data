import SunCalc from "suncalc";
import { ApiResp, TimeseriesPoint } from "@/types/current-conditions-response";
import { awdbDateToIso, fetchAwdbJson } from "./awdb";
import { AwdbStation, inferTimeZone } from "./stations";
import { MountainLocation } from "@/types/location";
import { fetchNwsCurrentAndTimeseries } from "./nws-current";

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

function toTemperatureHistorySeries(
  byElement: Map<string, Array<{ ts: string; value: number | null }>>,
  timeZone: string,
): TimeseriesPoint[] {
  const points = byElement.get("TOBS") ?? [];
  return points.map((point) => ({
    startTime: point.ts,
    hourLabel: toDateLabel(point.ts, timeZone),
    temperatureF: point.value == null ? null : Math.round(point.value),
    precipChancePct: null,
    wind: null,
    sky: null,
  }));
}

function getLatestObservedTemperaturePoint(
  byElement: Map<string, Array<{ ts: string; value: number | null }>>,
) {
  const points = byElement.get("TOBS") ?? [];
  for (let idx = points.length - 1; idx >= 0; idx -= 1) {
    const point = points[idx];
    if (point?.value == null) continue;
    return point;
  }
  return null;
}

export async function fetchSnotelCurrentConditions({
  station,
  locationMatch,
}: {
  station: AwdbStation;
  locationMatch: MountainLocation | null;
}): Promise<SnotelCurrentResponse> {
  const latitude = station.latitude ?? locationMatch?.lat ?? null;
  const longitude = station.longitude ?? locationMatch?.lon ?? null;
  if (latitude == null || longitude == null) {
    throw new Error("Station is missing latitude/longitude");
  }

  const hourlyData = await fetchAwdbJson<StationDataResponse>("/data", {
    stationTriplets: station.stationTriplet,
    elements: "TOBS",
    duration: "HOURLY",
    beginDate: -168,
    endDate: 0,
    unitSystem: "ENGLISH",
  });

  const tz = inferTimeZone(station, locationMatch);
  const byElement = toSeriesMap(hourlyData, station.dataTimeZone ?? null);
  const temperatureHistoryData = toTemperatureHistorySeries(byElement, tz);
  const latestTemp = getLatestObservedTemperaturePoint(byElement);

  const nws = await fetchNwsCurrentAndTimeseries({
    latitude,
    longitude,
    timeZone: tz,
    locationId: station.stationId,
  }).catch(() => null);

  const observedAt = latestTemp?.ts ?? null;
  const ageMin = minutesSince(observedAt);
  const snotelTemperatureF =
    latestTemp?.value == null ? null : Math.round(latestTemp.value);

  const baseCurrent = nws?.currentData ?? {
    locationId: station.stationId,
    stationId: station.stationId,
    source: observedAt ? ("observation" as const) : ("forecast" as const),
    observedAt,
    ageMin,
    isObserved: observedAt != null,
    isObservationStale: observedAt == null ? null : ageMin == null ? null : ageMin > 180,
    temperatureF: snotelTemperatureF,
    conditionText: observedAt ? "SNOTEL Observation" : "Conditions Unavailable",
    wind: {
      speedMph: null,
      directionDeg: null,
      directionText: null,
      arrowRotation: null,
      label: "Calm",
    },
  };

  return {
    currentData: {
      ...baseCurrent,
      locationId: station.stationId,
      stationId: station.stationId,
      source: observedAt ? "observation" : baseCurrent.source,
      observedAt,
      ageMin,
      isObserved: observedAt != null,
      isObservationStale: observedAt == null ? null : ageMin == null ? null : ageMin > 180,
      temperatureF:
        snotelTemperatureF == null
          ? baseCurrent.temperatureF
          : snotelTemperatureF,
      sun: {
        ...getSunTimes({
          lat: latitude,
          lon: longitude,
          date: new Date(),
          timeZone: tz,
        }),
        timeZone: tz,
      },
    },
    timeseriesData: nws?.timeseriesData ?? [],
    temperatureHistoryData,
    lastUpdatedAt: observedAt,
  };
}
