
export type HistoricDay = {
  date: string;
  derivedSnowfall?: number | null;
  snowDepthAtStartOfDay?: number | null;
  depthSource?: "SNWD" | "WTEQ" | null;
};