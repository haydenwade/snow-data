import { NextResponse } from "next/server";
import { LOCATIONS, cToF } from "../../../components/snow-report/utils";
import SunCalc from "suncalc";

const USER_AGENT = "snow-data (github.com)";
const STALE_MINUTES = 60;

const DENVER_TZ = "America/Denver";

// Compute the timezone offset (in minutes) for a given Date at a specific IANA timezone
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
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUTC = Date.UTC(
    n("year"),
    n("month") - 1,
    n("day"),
    n("hour"),
    n("minute"),
    n("second")
  );
  // minutes; positive means local time is ahead of UTC
  return (asUTC - date.getTime()) / 60000;
}

// Given any Date, return a Date representing midnight at that calendar day in the provided timezone
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

  const utcMid = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offsetMin = getTimeZoneOffsetAt(new Date(utcMid), timeZone);
  return new Date(utcMid - offsetMin * 60000);
}

export function getSunTimes({
  lat,
  lon,
  date,
}: {
  lat: number;
  lon: number;
  date: Date;
}) {
  // Use the location's local midnight to anchor "the day"
  const base = getMidnightInZone(date, DENVER_TZ);
  const times = SunCalc.getTimes(base, lat, lon);

  return {
    sunrise: times.sunrise ?? null,
    sunset: times.sunset ?? null,
  };
}

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

function minutesSince(iso?: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((Date.now() - t) / 60000));
}

// NWS observation windSpeed is meters/second (m/s)
function msToMph(ms?: number | null) {
  if (ms == null || Number.isNaN(ms)) return null;
  return ms * 2.236936;
}

function windLabel(mph?: number | null) {
  if (mph == null || Number.isNaN(mph)) return "Calm";
  const s = Math.abs(mph);
  if (s < 1) return "Calm";
  if (s < 6) return "Light";
  if (s < 15) return "Moderate";
  if (s < 25) return "Blustery"; // previously: "Fresh" as this is from Beaufort scale
  if (s < 40) return "Strong";
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
  return dirs[idx];
}

// For an arrow icon that points "up" by default.
// Meteorological convention: direction is where wind comes FROM.
function windArrowRotation(deg?: number | null): number | null {
  if (deg == null || Number.isNaN(deg)) return null;
  return ((deg % 360) + 360) % 360;
}

function cloudLayersToSky(cloudLayers: any[] | undefined): string | null {
  if (!Array.isArray(cloudLayers) || cloudLayers.length === 0) return null;

  const amounts = cloudLayers.map((l) => l?.amount).filter(Boolean);

  if (amounts.includes("OVC")) return "Overcast";
  if (amounts.includes("BKN")) return "Mostly Cloudy";
  if (amounts.includes("SCT")) return "Partly Cloudy";
  if (amounts.includes("FEW")) return "Mostly Clear";
  if (amounts.includes("CLR") || amounts.includes("SKC")) return "Clear";

  return null;
}

function presentWeatherToSky(presentWeather: any[] | undefined): string | null {
  if (!Array.isArray(presentWeather) || presentWeather.length === 0) return null;

  const first = presentWeather[0];
  return (
    nonEmptyString(first?.weather) ??
    nonEmptyString(first?.rawString) ??
    nonEmptyString(first?.description) ??
    null
  );
}

function normalizeCondition(s: string | null): string | null {
  if (!s) return null;
  const t = s.trim();
  if (!t) return null;

  const lower = t.toLowerCase();

  if (lower.includes("overcast")) return "Overcast";
  if (lower.includes("mostly cloudy")) return "Mostly Cloudy";
  if (lower.includes("partly cloudy")) return "Partly Cloudy";
  if (lower.includes("mostly clear")) return "Mostly Clear";
  if (lower === "clear") return "Clear";
  if (lower.includes("cloudy")) return "Cloudy";

  if (lower.includes("thunder")) return "Thunderstorms";
  if (lower.includes("snow")) return "Snow";
  if (lower.includes("sleet")) return "Sleet";
  if (lower.includes("freezing rain")) return "Freezing Rain";
  if (lower.includes("rain")) return "Rain";
  if (lower.includes("drizzle")) return "Drizzle";
  if (lower.includes("fog") || lower.includes("mist")) return "Fog";
  if (lower.includes("haze") || lower.includes("smoke")) return "Hazy";

  return t;
}

// "5 to 10 mph" -> 10, "12 mph" -> 12, "10 kt" -> convert, etc.
function parseWindSpeedToMph(text?: string | null): number | null {
  if (!text) return null;
  const s = text.toLowerCase().trim();
  if (!s) return null;

  const nums = s.match(/(\d+(\.\d+)?)/g)?.map((n) => Number(n)) ?? [];
  if (nums.length === 0 || nums.some((n) => Number.isNaN(n))) return null;

  const value = Math.max(...nums);

  if (s.includes("kt") || s.includes("kts") || s.includes("knot")) {
    return value * 1.15078;
  }
  if (s.includes("km/h") || s.includes("kph")) {
    return value * 0.621371;
  }

  return value; // mph
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const json = res.ok ? await res.json() : null;
  return { res, json };
}

function filterNextHours(periods: any[], hours: number) {
  const now = Date.now();
  const end = now + hours * 60 * 60 * 1000;

  return periods.filter((p) => {
    const startTime = p?.startTime;
    if (!startTime) return false;
    const t = Date.parse(startTime);
    if (Number.isNaN(t)) return false;
    return t >= now && t <= end;
  });
}

// Picks the closest point in timeseries to "now" (past or future).
function pickClosestTimeseriesPoint(timeseriesData: any[]) {
  const now = Date.now();
  let best: any | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const p of timeseriesData) {
    const t = p?.startTime ? Date.parse(p.startTime) : NaN;
    if (Number.isNaN(t)) continue;

    const diff = Math.abs(t - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = p;
    }
  }

  return best;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const locationId = url.searchParams.get("locationId");
    if (!locationId) {
      return NextResponse.json(
        { error: "missing locationId" },
        { status: 400 }
      );
    }

    const loc = LOCATIONS.find((l) => l.id === locationId);
    if (!loc) {
      return NextResponse.json(
        { error: "unknown locationId" },
        { status: 404 }
      );
    }

    // 1) POINTS
    const { res: pointsRes, json: pointsJson } = await fetchJson(
      `https://api.weather.gov/points/${loc.lat},${loc.lon}`
    );
    if (!pointsRes.ok || !pointsJson?.properties) {
      return NextResponse.json(
        { error: "failed to fetch points" },
        { status: 502 }
      );
    }

    const stationsUrl = pointsJson.properties.observationStations as
      | string
      | undefined;
    const hourlyUrl = pointsJson.properties.forecastHourly as string | undefined;

    if (!stationsUrl) {
      return NextResponse.json(
        { error: "no observationStations for point" },
        { status: 502 }
      );
    }
    if (!hourlyUrl) {
      return NextResponse.json(
        { error: "no forecastHourly for point" },
        { status: 502 }
      );
    }

    // 2) FETCH HOURLY FORECAST (timeseries source)
    const { res: hourlyRes, json: hourlyJson } = await fetchJson(hourlyUrl);
    if (!hourlyRes.ok || !hourlyJson?.properties?.periods?.length) {
      return NextResponse.json(
        { error: "failed to fetch forecastHourly" },
        { status: 502 }
      );
    }

    const hourlyPeriodsAll: any[] = hourlyJson.properties.periods;
    const hourlyPeriodsNext24 = filterNextHours(hourlyPeriodsAll, 24);

    // If next24 is empty, fall back to everything
    const hourlyPeriods = hourlyPeriodsNext24.length
      ? hourlyPeriodsNext24
      : hourlyPeriodsAll;

    // Build timeseriesData[] (for your tabs)
    const timeseriesData = hourlyPeriods.map((p) => {
      const startTime: string | null = p?.startTime ?? null;
      const temperatureF: number | null =
        typeof p?.temperature === "number" ? p.temperature : null;

      const sky =
        normalizeCondition(nonEmptyString(p?.shortForecast)) ??
        normalizeCondition(nonEmptyString(p?.detailedForecast)) ??
        null;

      const windSpeedMphParsed = parseWindSpeedToMph(
        nonEmptyString(p?.windSpeed)
      );
      const windSpeedMph =
        windSpeedMphParsed == null ? null : Math.round(windSpeedMphParsed);

      const windDirectionText = nonEmptyString(p?.windDirection) ?? null;

      // NWS hourly gives probabilityOfPrecipitation.value (0-100 or null)
      const precipChancePct: number | null =
        typeof p?.probabilityOfPrecipitation?.value === "number"
          ? p.probabilityOfPrecipitation.value
          : null;

      return {
        startTime, // ISO (local offset)
        hourLabel: startTime
          ? new Date(startTime).toLocaleTimeString("en-US", {
              timeZone: "America/Denver",
              hour: "numeric",
            })
          : null,

        temperatureF,
        precipChancePct,

        wind: {
          speedMph: windSpeedMph,
          directionText: windDirectionText,
          label: windLabel(windSpeedMph),
        },

        sky,
        raw: {
          shortForecast: nonEmptyString(p?.shortForecast),
          windSpeed: nonEmptyString(p?.windSpeed),
          windDirection: nonEmptyString(p?.windDirection),
        },
      };
    });

    // 3) STATIONS -> first station id (for real observations)
    const { res: stationsRes, json: stationsJson } = await fetchJson(stationsUrl);
    if (!stationsRes.ok || !stationsJson?.features?.length) {
      return NextResponse.json(
        { error: "failed to fetch stations" },
        { status: 502 }
      );
    }

    const firstFeature = stationsJson.features[0];
    const stationId =
      firstFeature?.properties?.stationIdentifier || firstFeature?.id || null;

    if (!stationId) {
      return NextResponse.json(
        { error: "unable to determine station id" },
        { status: 502 }
      );
    }

    // 4) LATEST OBSERVATION (for currentData)
    const { res: obsRes, json: obsJson } = await fetchJson(
      `https://api.weather.gov/stations/${stationId}/observations/latest`
    );

    let currentSource: "observation" | "forecast" = "observation";

    let observedAt: string | null = null;
    let ageMin: number | null = null;

    let temperatureF: number | null = null;
    let windSpeedMph: number | null = null;
    let windDirectionDeg: number | null = null;
    let windDirectionText: string | null = null;

    let conditionText: string | null = null;

    if (obsRes.ok && obsJson?.properties) {
      const props = obsJson.properties;

      observedAt = props.timestamp ?? null;
      ageMin = minutesSince(observedAt);

      const tempC = props.temperature?.value;
      temperatureF = typeof tempC === "number" ? Math.round(cToF(tempC)) : null;

      const windMs = props.windSpeed?.value;
      const mph = typeof windMs === "number" ? msToMph(windMs) : null;
      windSpeedMph = typeof mph === "number" ? Math.round(mph) : null;

      windDirectionDeg = props.windDirection?.value ?? null;
      windDirectionText = degToCardinal(windDirectionDeg);

      const rawCondition =
        nonEmptyString(props.textDescription) ??
        presentWeatherToSky(props.presentWeather) ??
        cloudLayersToSky(props.cloudLayers) ??
        null;

      conditionText = normalizeCondition(rawCondition);
    }

    const isObsStale = ageMin == null ? true : ageMin > STALE_MINUTES;

    // Hourly fallback for currentData (choose the closest hour to now)
    const closestHour = pickClosestTimeseriesPoint(timeseriesData);

    const needsFallback =
      isObsStale ||
      temperatureF == null ||
      conditionText == null ||
      windSpeedMph == null ||
      (windDirectionText == null && windDirectionDeg == null);

    if (needsFallback && closestHour) {
      currentSource = "forecast";

      observedAt = closestHour.startTime ?? observedAt;
      ageMin = minutesSince(observedAt);

      if (typeof closestHour.temperatureF === "number") {
        temperatureF = closestHour.temperatureF;
      }

      if (closestHour.sky) {
        conditionText = closestHour.sky;
      }

      if (typeof closestHour.wind?.speedMph === "number") {
        windSpeedMph = closestHour.wind.speedMph;
      }

      if (typeof closestHour.wind?.directionText === "string") {
        windDirectionText = closestHour.wind.directionText;
      }

      // Hourly doesn't give degrees; keep obs degrees if present, else null.
      windDirectionDeg = windDirectionDeg ?? null;
    }

    if (!conditionText) conditionText = "Conditions Unavailable";

    const currentData = {
      locationId,
      stationId,
      source: currentSource, // "observation" | "forecast"
      observedAt,
      ageMin,

      // Replaces "isStale" with clearer fields
      isObserved: currentSource === "observation",
      isObservationStale:
        currentSource === "observation" ? isObsStale : null,

      temperatureF,

      conditionText,

      wind: {
        speedMph: windSpeedMph,
        directionDeg: windDirectionDeg,
        directionText: windDirectionText,
        arrowRotation: windArrowRotation(windDirectionDeg),
        label: windLabel(windSpeedMph),
      },
      sun: {
        ...getSunTimes({ lat: loc.lat, lon: loc.lon, date: new Date() }),
        timeZone: DENVER_TZ,
      },
    };

    return NextResponse.json(
      {
        currentData,
        timeseriesData, // hourly periods (next 24h, else full feed)
      },
      { status: 200 }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/api/current error", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
