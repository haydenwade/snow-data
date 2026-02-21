import { ForecastGridData, GridSeries, SeriesPoint } from "@/types/forecast";

type OpenMeteoHourly = {
  time?: Array<number | string>;
  snowfall?: Array<number | null>;
  temperature_2m?: Array<number | null>;
  windspeed_10m?: Array<number | null>;
  wind_speed_10m?: Array<number | null>;
};

type OpenMeteoForecastResponse = {
  hourly?: OpenMeteoHourly;
};

function emptySeries(uom: string): GridSeries {
  return { uom, points: [] };
}

function unixSecondsToIso(value: number | string): string | null {
  const numeric =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value), 10);
  if (!Number.isFinite(numeric)) return null;
  const ms = numeric * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function mapHourlySeries(
  times: Array<number | string>,
  values: Array<number | null> | undefined,
  {
    nullValue = null,
    mapValue = (value: number) => value,
  }: {
    nullValue?: number | null;
    mapValue?: (value: number) => number;
  } = {},
): SeriesPoint[] {
  if (!Array.isArray(values) || values.length === 0) return [];
  const points: SeriesPoint[] = [];

  for (let index = 0; index < times.length; index += 1) {
    const iso = unixSecondsToIso(times[index] as number | string);
    if (!iso) continue;
    const rawValue = values[index];
    const numeric =
      rawValue == null
        ? nullValue
        : Number.isFinite(rawValue)
        ? Number(rawValue)
        : null;
    if (numeric == null || !Number.isFinite(numeric)) continue;
    points.push({
      start: iso,
      hours: 1,
      value: mapValue(numeric),
    });
  }

  return points;
}

function snowfallToPopSeries(
  times: Array<number | string>,
  snowfallValues: Array<number | null> | undefined,
): SeriesPoint[] {
  if (!Array.isArray(snowfallValues) || snowfallValues.length === 0) return [];
  const points: SeriesPoint[] = [];

  for (let index = 0; index < times.length; index += 1) {
    const iso = unixSecondsToIso(times[index] as number | string);
    if (!iso) continue;
    const snowfall = snowfallValues[index];
    const value =
      typeof snowfall === "number" && Number.isFinite(snowfall) && snowfall > 0
        ? 100
        : 0;
    points.push({
      start: iso,
      hours: 1,
      value,
    });
  }

  return points;
}

export async function fetchOpenMeteoForecastGridData(
  latitude: number,
  longitude: number,
): Promise<ForecastGridData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: "snowfall,temperature_2m,wind_speed_10m",
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
      `Open-Meteo request failed (${response.status}): ${body.slice(0, 600)}`,
    );
  }

  const json = (await response.json()) as OpenMeteoForecastResponse;
  const hourly = json.hourly ?? {};
  const times = Array.isArray(hourly.time) ? hourly.time : [];
  const snowfallValues = Array.isArray(hourly.snowfall)
    ? hourly.snowfall
    : undefined;
  const temperatureValues = Array.isArray(hourly.temperature_2m)
    ? hourly.temperature_2m
    : undefined;
  const windValues = Array.isArray(hourly.windspeed_10m)
    ? hourly.windspeed_10m
    : Array.isArray(hourly.wind_speed_10m)
    ? hourly.wind_speed_10m
    : undefined;

  return {
    snowfallAmount: {
      uom: "wmoUnit:mm",
      points: mapHourlySeries(times, snowfallValues, {
        nullValue: 0,
        mapValue: (valueCm) => valueCm * 10,
      }),
    },
    probabilityOfPrecipitation: {
      uom: "wmoUnit:percent",
      points: snowfallToPopSeries(times, snowfallValues),
    },
    temperature2m: {
      uom: "wmoUnit:degC",
      points: mapHourlySeries(times, temperatureValues),
    },
    windSpeed: {
      uom: "wmoUnit:km_h-1",
      points: mapHourlySeries(times, windValues),
    },
    quantitativePrecipitation: emptySeries("wmoUnit:mm"),
    maxTemperature: emptySeries("wmoUnit:degC"),
    minTemperature: emptySeries("wmoUnit:degC"),
    windDirection: emptySeries("wmoUnit:degree_(angle)"),
    skyCover: emptySeries("wmoUnit:percent"),
  };
}
