import { ApiResp, TimeseriesPoint } from "@/types/current-conditions-response";

type OpenMeteoCurrent = {
  time?: number | string;
  temperature_2m?: number | null;
  wind_speed_10m?: number | null;
  windspeed_10m?: number | null;
  wind_direction_10m?: number | null;
  winddirection_10m?: number | null;
  weather_code?: number | null;
  weathercode?: number | null;
};

type OpenMeteoHourly = {
  time?: Array<number | string>;
  temperature_2m?: Array<number | null>;
  wind_speed_10m?: Array<number | null>;
  windspeed_10m?: Array<number | null>;
  wind_direction_10m?: Array<number | null>;
  winddirection_10m?: Array<number | null>;
  snowfall?: Array<number | null>;
  weather_code?: Array<number | null>;
  weathercode?: Array<number | null>;
};

type OpenMeteoCurrentResponse = {
  current?: OpenMeteoCurrent;
  hourly?: OpenMeteoHourly;
};

function minutesSince(iso?: string | null): number | null {
  if (!iso) return null;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
}

function cToF(celsius: number) {
  return (celsius * 9) / 5 + 32;
}

function kphToMph(kph: number) {
  return kph * 0.621371;
}

function windLabel(mph?: number | null) {
  if (mph == null || Number.isNaN(mph)) return null;
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

function weatherCodeToCondition(weatherCode?: number | null): string | null {
  if (weatherCode == null || Number.isNaN(weatherCode)) return null;
  const code = Math.round(weatherCode);
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 56 || code === 57) return "Freezing Rain";
  if (code === 61 || code === 63 || code === 65) return "Rain";
  if (code === 66 || code === 67) return "Freezing Rain";
  if (code === 71 || code === 73 || code === 75) return "Snow";
  if (code === 77) return "Snow";
  if (code === 80 || code === 81 || code === 82) return "Rain";
  if (code === 85 || code === 86) return "Snow";
  if (code === 95 || code === 96 || code === 99) return "Thunderstorms";
  return null;
}

function unixSecondsToIso(value: number | string | null | undefined): string | null {
  if (value == null) return null;
  const numeric =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value), 10);
  if (!Number.isFinite(numeric)) return null;
  const date = new Date(numeric * 1000);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function hourLabelInTimeZone(iso: string, timeZone: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
  });
}

function numberOrNull(value: unknown): number | null {
  if (value == null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function valueAt(values: Array<number | null> | undefined, index: number): number | null {
  if (!Array.isArray(values) || index >= values.length) return null;
  const value = values[index];
  return numberOrNull(value);
}

function snowfallToPrecipChance(snowfallMm: number | null): number | null {
  if (snowfallMm == null) return null;
  return snowfallMm > 0 ? 100 : 0;
}

function toTimeseries({
  hourly,
  timeZone,
}: {
  hourly: OpenMeteoHourly | undefined;
  timeZone: string;
}): TimeseriesPoint[] {
  const times = Array.isArray(hourly?.time) ? hourly?.time : [];
  const temperatureValues = Array.isArray(hourly?.temperature_2m)
    ? hourly.temperature_2m
    : undefined;
  const windSpeedValues = Array.isArray(hourly?.wind_speed_10m)
    ? hourly.wind_speed_10m
    : Array.isArray(hourly?.windspeed_10m)
    ? hourly.windspeed_10m
    : undefined;
  const windDirectionValues = Array.isArray(hourly?.wind_direction_10m)
    ? hourly.wind_direction_10m
    : Array.isArray(hourly?.winddirection_10m)
    ? hourly.winddirection_10m
    : undefined;
  const snowfallValues = Array.isArray(hourly?.snowfall) ? hourly.snowfall : undefined;
  const weatherCodeValues = Array.isArray(hourly?.weather_code)
    ? hourly.weather_code
    : Array.isArray(hourly?.weathercode)
    ? hourly.weathercode
    : undefined;

  const points: TimeseriesPoint[] = [];

  for (let index = 0; index < times.length; index += 1) {
    const iso = unixSecondsToIso(times[index] as number | string);
    if (!iso) continue;

    const temperatureC = valueAt(temperatureValues, index);
    const windSpeedKph = valueAt(windSpeedValues, index);
    const windDirectionDeg = valueAt(windDirectionValues, index);
    const snowfallMm = valueAt(snowfallValues, index);
    const weatherCode = valueAt(weatherCodeValues, index);

    const temperatureF =
      temperatureC == null ? null : Math.round(cToF(temperatureC));
    const windSpeedMph =
      windSpeedKph == null ? null : Math.round(kphToMph(windSpeedKph));
    const windDirectionText = degToCardinal(windDirectionDeg);
    const windInfo =
      windSpeedMph == null && windDirectionText == null
        ? null
        : {
            speedMph: windSpeedMph,
            directionText: windDirectionText,
            label: windLabel(windSpeedMph),
          };

    points.push({
      startTime: iso,
      hourLabel: hourLabelInTimeZone(iso, timeZone),
      temperatureF,
      precipChancePct: snowfallToPrecipChance(snowfallMm),
      wind: windInfo,
      sky: weatherCodeToCondition(weatherCode),
    });
  }

  return points;
}

export async function fetchOpenMeteoCurrentAndTimeseries({
  latitude,
  longitude,
  timeZone,
  stationId,
}: {
  latitude: number;
  longitude: number;
  timeZone: string;
  stationId: string;
}): Promise<Pick<ApiResp, "currentData" | "timeseriesData">> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,wind_speed_10m,wind_direction_10m,weather_code",
    hourly: "temperature_2m,wind_speed_10m,wind_direction_10m,snowfall,weather_code",
    forecast_hours: "24",
    timeformat: "unixtime",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Open-Meteo current request failed (${response.status}): ${body.slice(0, 600)}`,
    );
  }

  const json = (await response.json()) as OpenMeteoCurrentResponse;
  const current = json.current;
  const currentIso = unixSecondsToIso(current?.time);
  const currentTemperatureC = numberOrNull(current?.temperature_2m);
  const currentWindSpeedKph = numberOrNull(
    current?.wind_speed_10m ?? current?.windspeed_10m,
  );
  const currentWindDirectionDeg = numberOrNull(
    current?.wind_direction_10m ?? current?.winddirection_10m,
  );
  const currentWeatherCode = numberOrNull(current?.weather_code ?? current?.weathercode);
  const currentWindSpeedMph =
    currentWindSpeedKph == null ? null : Math.round(kphToMph(currentWindSpeedKph));

  return {
    currentData: {
      stationId,
      source: "forecast",
      observedAt: currentIso,
      ageMin: minutesSince(currentIso),
      isObserved: false,
      isObservationStale: null,
      temperatureF:
        currentTemperatureC == null ? null : Math.round(cToF(currentTemperatureC)),
      conditionText: weatherCodeToCondition(currentWeatherCode) ?? "Conditions Unavailable",
      wind: {
        speedMph: currentWindSpeedMph,
        directionDeg:
          currentWindDirectionDeg == null
            ? null
            : Math.round(currentWindDirectionDeg),
        directionText: degToCardinal(currentWindDirectionDeg),
        arrowRotation: windArrowRotation(currentWindDirectionDeg),
        label: windLabel(currentWindSpeedMph),
      },
    },
    timeseriesData: toTimeseries({
      hourly: json.hourly,
      timeZone,
    }),
  };
}
