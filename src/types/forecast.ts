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
  maxTemperature?: GridSeries; // degC
  minTemperature?: GridSeries; // degC
  windDirection?: GridSeries; // degrees
  windSpeed?: GridSeries; // km/h
  skyCover?: GridSeries; // %
};

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
};
