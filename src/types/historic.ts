
export type HistoricDay = {
  date: string;
  derivedSnowfall?: number | null;
  snowDepthAtStartOfDay?: number | null;
  depthSource?: "SNWD" | "WTEQ" | null;
  tempHighF?: number | null;
  tempLowF?: number | null;
  tempAvgF?: number | null;
};

export type HistoricHourlyTemperaturePoint = {
  timestamp: string;
  temperatureF: number | null;
};
