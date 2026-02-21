
export type TimeseriesPoint = {
  startTime: string | null;
  hourLabel: string | null;
  temperatureF: number | null;
  precipChancePct: number | null;
  wind: {
    speedMph: number | null;
    directionText: string | null;
    label: string | null;
  } | null;
  sky: string | null;
};

export type ApiResp = {
  lastUpdatedAt?: string | null;
  temperatureHistoryData?: TimeseriesPoint[];
  currentData: {
    locationId: string;
    stationId: string | null;
    source: "observation" | "forecast";
    observedAt: string | null;
    ageMin: number | null;

    isObserved: boolean;
    isObservationStale: boolean | null;

    temperatureF: number | null;
    conditionText: string | null;

    wind: {
      speedMph: number | null;
      directionDeg: number | null;
      directionText: string | null;
      arrowRotation: number | null;
      label: string | null;
    } | null;
    sun?: {
      sunrise: string | null;
      sunset: string | null;
      timeZone?: string | null;
    } | null;
  };
  timeseriesData: TimeseriesPoint[];
};
