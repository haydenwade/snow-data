import { ForecastGridData, GridSeries, SeriesPoint } from "@/types/forecast";

function parseValidTime(validTime: string): { start: string; hours: number } {
  const [start, duration] = validTime.split("/");
  let hours = 0;
  const match = /PT(\d+)([HMS])/i.exec(duration ?? "");
  if (match) {
    const quantity = parseInt(match[1] ?? "0", 10);
    const unit = (match[2] ?? "").toUpperCase();
    if (unit === "H") hours = quantity;
    if (unit === "M") hours = quantity / 60;
    if (unit === "S") hours = quantity / 3600;
  }
  return { start, hours };
}

function mapSeries(properties: Record<string, any>, key: string): GridSeries {
  const series = properties[key] ?? {};
  const uom = typeof series.uom === "string" ? series.uom : "";
  const values = Array.isArray(series.values) ? series.values : [];
  const points: SeriesPoint[] = values.map((value: { validTime?: string; value?: number | null }) => {
    const parsed = parseValidTime(String(value?.validTime ?? ""));
    const numericValue =
      value?.value == null ? 0 : Number(value.value);
    return {
      start: parsed.start,
      hours: parsed.hours || 1,
      value: Number.isFinite(numericValue) ? numericValue : 0,
    };
  });
  return { uom, points };
}

async function fetchNwsJson(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/geo+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`NWS request failed (${res.status}): ${body.slice(0, 600)}`);
  }

  return await res.json();
}

export async function fetchNwsForecastGridData(
  latitude: number,
  longitude: number,
): Promise<ForecastGridData> {
  const points = await fetchNwsJson(
    `https://api.weather.gov/points/${latitude},${longitude}`,
  );

  const gridUrl: string | undefined = points?.properties?.forecastGridData;
  if (!gridUrl) throw new Error("Missing forecastGridData URL");

  const grid = await fetchNwsJson(gridUrl);
  const properties = grid?.properties ?? {};

  return {
    snowfallAmount: mapSeries(properties, "snowfallAmount"),
    quantitativePrecipitation: mapSeries(properties, "quantitativePrecipitation"),
    probabilityOfPrecipitation: mapSeries(properties, "probabilityOfPrecipitation"),
    maxTemperature: mapSeries(properties, "maxTemperature"),
    minTemperature: mapSeries(properties, "minTemperature"),
    windDirection: mapSeries(properties, "windDirection"),
    windSpeed: mapSeries(properties, "windSpeed"),
    skyCover: mapSeries(properties, "skyCover"),
  };
}
