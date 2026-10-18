export type Unit = "in" | "mm";


export type SeriesPoint = { start: string; hours: number; value: number };

export type GridSeries = {
  uom: string;
  points: SeriesPoint[];
};

export type ForecastGridData = {
  snowfallAmount: GridSeries; // mm
  quantitativePrecipitation?: GridSeries; // mm (liquid)
  probabilityOfPrecipitation: GridSeries; // %
  temperature2m?: GridSeries; // degC (hourly fallback when max/min not available)
  maxTemperature?: GridSeries; // degC
  minTemperature?: GridSeries; // degC
  windDirection?: GridSeries; // degrees
  windSpeed?: GridSeries; // km/h
  skyCover?: GridSeries; // %
  snowLevel?: GridSeries; // m (NWS forecast snow level)
  freezingLevel?: GridSeries; // m (Open-Meteo fallback; ~1,000 ft above snow level)
};

export type SnowLevelKind = "snow-level" | "freezing-level";

export type ForecastDaily = {
  date: string; // YYYY-MM-DD in America/Denver
  snowIn: number; // inches
  pop: number; // % (daily max)
  tMinF?: number;
  tMaxF?: number;
  tMinC?: number;
  tMaxC?: number;
  // aggregated wind (mph) and direction (degrees)
  windMph?: number;
  windDirDeg?: number;
  // sky cover percent (0-100)
  skyCoverPercent?: number;
  // daily range of the forecast snow level (or freezing level fallback), feet
  snowLevelMinFt?: number;
  snowLevelMaxFt?: number;
  // snow level range during hours where precip is likely, feet
  wetSnowLevelMinFt?: number;
  wetSnowLevelMaxFt?: number;
  snowLevelKind?: SnowLevelKind;
};
