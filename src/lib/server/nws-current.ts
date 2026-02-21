import { TimeseriesPoint, ApiResp } from "@/types/current-conditions-response";

const NWS_USER_AGENT = "snow-data (github.com)";
const NWS_OBSERVATION_STALE_MINUTES = 60;

type HourlyForecastPeriod = {
  startTime?: string;
  temperature?: number;
  shortForecast?: string;
  detailedForecast?: string;
  windSpeed?: string;
  windDirection?: string;
  probabilityOfPrecipitation?: {
    value?: number | null;
  } | null;
};

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function minutesSince(iso?: string | null): number | null {
  if (!iso) return null;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
}

function cToF(celsius: number) {
  return (celsius * 9) / 5 + 32;
}

function msToMph(ms?: number | null) {
  if (ms == null || Number.isNaN(ms)) return null;
  return ms * 2.236936;
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

function cloudLayersToSky(cloudLayers: unknown): string | null {
  if (!Array.isArray(cloudLayers) || cloudLayers.length === 0) return null;
  const amounts = cloudLayers.map((layer) => (layer as { amount?: unknown })?.amount);
  if (amounts.includes("OVC")) return "Overcast";
  if (amounts.includes("BKN")) return "Mostly Cloudy";
  if (amounts.includes("SCT")) return "Partly Cloudy";
  if (amounts.includes("FEW")) return "Mostly Clear";
  if (amounts.includes("CLR") || amounts.includes("SKC")) return "Clear";
  return null;
}

function presentWeatherToSky(presentWeather: unknown): string | null {
  if (!Array.isArray(presentWeather) || presentWeather.length === 0) return null;
  const first = presentWeather[0] as
    | { weather?: unknown; rawString?: unknown; description?: unknown }
    | undefined;
  return (
    nonEmptyString(first?.weather) ??
    nonEmptyString(first?.rawString) ??
    nonEmptyString(first?.description) ??
    null
  );
}

function normalizeCondition(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

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

  return trimmed;
}

function parseWindSpeedToMph(text?: string | null): number | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();
  if (!lower) return null;
  const values = lower.match(/(\d+(\.\d+)?)/g)?.map(Number) ?? [];
  if (values.length === 0 || values.some((value) => Number.isNaN(value))) {
    return null;
  }
  const maxValue = Math.max(...values);
  if (lower.includes("kt") || lower.includes("knot")) return maxValue * 1.15078;
  if (lower.includes("km/h") || lower.includes("kph")) return maxValue * 0.621371;
  return maxValue;
}

function filterNextHours(periods: Array<{ startTime?: string }>, hours: number) {
  const now = Date.now();
  const end = now + hours * 60 * 60 * 1000;
  return periods.filter((period) => {
    const startTime = period.startTime;
    if (!startTime) return false;
    const ts = Date.parse(startTime);
    if (Number.isNaN(ts)) return false;
    return ts >= now && ts <= end;
  });
}

function pickClosestTimeseriesPoint(timeseriesData: TimeseriesPoint[]) {
  const now = Date.now();
  let best: TimeseriesPoint | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const point of timeseriesData) {
    const ts = point.startTime ? Date.parse(point.startTime) : NaN;
    if (Number.isNaN(ts)) continue;
    const diff = Math.abs(ts - now);
    if (diff < bestDiff) {
      best = point;
      bestDiff = diff;
    }
  }
  return best;
}

async function fetchNwsJson(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": NWS_USER_AGENT,
      Accept: "application/geo+json",
    },
    cache: "no-store",
  });
  const json = response.ok ? await response.json() : null;
  return { response, json };
}

export async function fetchNwsCurrentAndTimeseries({
  latitude,
  longitude,
  timeZone,
  stationId,
}: {
  latitude: number;
  longitude: number;
  timeZone: string;
  stationId: string;
}) {
  const { response: pointsResponse, json: pointsJson } = await fetchNwsJson(
    `https://api.weather.gov/points/${latitude},${longitude}`,
  );
  if (!pointsResponse.ok || !pointsJson?.properties) {
    throw new Error("Failed to fetch NWS point metadata");
  }

  const stationsUrl = pointsJson.properties.observationStations as
    | string
    | undefined;
  const hourlyUrl = pointsJson.properties.forecastHourly as string | undefined;
  if (!stationsUrl) throw new Error("NWS point metadata missing observationStations URL");
  if (!hourlyUrl) throw new Error("NWS point metadata missing forecastHourly URL");

  const { response: hourlyResponse, json: hourlyJson } = await fetchNwsJson(hourlyUrl);
  if (!hourlyResponse.ok || !Array.isArray(hourlyJson?.properties?.periods)) {
    throw new Error("Failed to fetch NWS forecastHourly data");
  }

  const hourlyPeriodsAll = hourlyJson.properties.periods as HourlyForecastPeriod[];
  const hourlyPeriodsNext24 = filterNextHours(hourlyPeriodsAll, 24);
  const hourlyPeriods: HourlyForecastPeriod[] =
    hourlyPeriodsNext24.length > 0 ? hourlyPeriodsNext24 : hourlyPeriodsAll;

  const timeseriesData: TimeseriesPoint[] = hourlyPeriods.map((period) => {
    const startTime = nonEmptyString(period.startTime) ?? null;
    const temperatureF =
      typeof period.temperature === "number" ? period.temperature : null;
    const sky =
      normalizeCondition(nonEmptyString(period.shortForecast)) ??
      normalizeCondition(nonEmptyString(period.detailedForecast)) ??
      null;
    const windSpeedMphRaw = parseWindSpeedToMph(nonEmptyString(period.windSpeed));
    const windSpeedMph = windSpeedMphRaw == null ? null : Math.round(windSpeedMphRaw);
    const windDirectionText = nonEmptyString(period.windDirection) ?? null;
    const precipChancePct =
      typeof period.probabilityOfPrecipitation?.value === "number"
        ? (period.probabilityOfPrecipitation?.value ?? null)
        : null;

    return {
      startTime,
      hourLabel: startTime
        ? new Date(startTime).toLocaleTimeString("en-US", {
            timeZone,
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
    };
  });

  const { response: stationsResponse, json: stationsJson } = await fetchNwsJson(stationsUrl);
  if (!stationsResponse.ok || !Array.isArray(stationsJson?.features) || stationsJson.features.length === 0) {
    throw new Error("Failed to fetch NWS observation stations");
  }

  const firstFeature = stationsJson.features[0] as
    | { properties?: { stationIdentifier?: string }; id?: string }
    | undefined;
  const nwsStationId =
    firstFeature?.properties?.stationIdentifier ?? firstFeature?.id ?? null;
  if (!nwsStationId) throw new Error("Unable to determine NWS station id");

  const { response: obsResponse, json: obsJson } = await fetchNwsJson(
    `https://api.weather.gov/stations/${nwsStationId}/observations/latest`,
  );

  let currentSource: "observation" | "forecast" = "observation";
  let observedAt: string | null = null;
  let ageMin: number | null = null;
  let temperatureF: number | null = null;
  let windSpeedMph: number | null = null;
  let windDirectionDeg: number | null = null;
  let windDirectionText: string | null = null;
  let conditionText: string | null = null;

  if (obsResponse.ok && obsJson?.properties) {
    const props = obsJson.properties as Record<string, any>;
    observedAt = nonEmptyString(props.timestamp);
    ageMin = minutesSince(observedAt);
    const tempC = props.temperature?.value;
    temperatureF = typeof tempC === "number" ? Math.round(cToF(tempC)) : null;
    const windMs = props.windSpeed?.value;
    const mph = typeof windMs === "number" ? msToMph(windMs) : null;
    windSpeedMph = typeof mph === "number" ? Math.round(mph) : null;
    windDirectionDeg =
      typeof props.windDirection?.value === "number"
        ? props.windDirection.value
        : null;
    windDirectionText = degToCardinal(windDirectionDeg);

    const rawCondition =
      nonEmptyString(props.textDescription) ??
      presentWeatherToSky(props.presentWeather) ??
      cloudLayersToSky(props.cloudLayers) ??
      null;
    conditionText = normalizeCondition(rawCondition);
  }

  const closestForecast = pickClosestTimeseriesPoint(timeseriesData);
  const isObservationStale = ageMin == null ? true : ageMin > NWS_OBSERVATION_STALE_MINUTES;
  const needsForecastFallback =
    isObservationStale ||
    temperatureF == null ||
    conditionText == null ||
    windSpeedMph == null ||
    (windDirectionText == null && windDirectionDeg == null);

  if (needsForecastFallback && closestForecast) {
    currentSource = "forecast";
    observedAt = closestForecast.startTime ?? observedAt;
    ageMin = minutesSince(observedAt);
    if (typeof closestForecast.temperatureF === "number") {
      temperatureF = closestForecast.temperatureF;
    }
    if (closestForecast.sky) {
      conditionText = closestForecast.sky;
    }
    if (typeof closestForecast.wind?.speedMph === "number") {
      windSpeedMph = closestForecast.wind.speedMph;
    }
    if (typeof closestForecast.wind?.directionText === "string") {
      windDirectionText = closestForecast.wind.directionText;
    }
  }

  if (!conditionText) conditionText = "Conditions Unavailable";

  const currentData: ApiResp["currentData"] = {
    stationId: nwsStationId,
    source: currentSource,
    observedAt,
    ageMin,
    isObserved: currentSource === "observation",
    isObservationStale:
      currentSource === "observation" ? isObservationStale : null,
    temperatureF,
    conditionText,
    wind: {
      speedMph: windSpeedMph,
      directionDeg: windDirectionDeg,
      directionText: windDirectionText,
      arrowRotation: windArrowRotation(windDirectionDeg),
      label: windLabel(windSpeedMph),
    },
  };

  return {
    currentData,
    timeseriesData,
  };
}
