export type Unit = "in" | "mm";

export type Location = {
  id: string;
  stationId: string;
  name: string;
  network: string;
  county: string;
  elevation: string;
  lat: number;
  lon: number;
  huc: string;
  stationTriplet: string;
};

export type HistoricDay = {
  date: string;
  derivedSnowfall?: number | null;
  snowDepthAtStartOfDay?: number | null;
};

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
};

export type ForecastDaily = {
  date: string; // YYYY-MM-DD in America/Denver
  snowIn: number; // inches
  pop: number; // % (daily max)
  tMinF?: number;
  tMaxF?: number;
  tMinC?: number;
  tMaxC?: number;
};

export const DENVER_TZ = "America/Denver";

export function dateKeyDenver(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: DENVER_TZ });
}

export function isoToDate(iso: string) {
  return new Date(iso);
}

export function toInches(mm: number) {
  return mm / 25.4;
}

export function cToF(c: number) {
  return (c * 9) / 5 + 32;
}

export function parseValidTime(validTime: string): { start: string; hours: number } {
  const [start, dur] = validTime.split("/");
  let hours = 0;
  const m = /PT(\d+)([HM])/i.exec(dur);
  if (m) {
    const n = parseInt(m[1], 10);
    hours = m[2].toUpperCase() === "H" ? n : n / 60;
  }
  return { start, hours };
}

export function expandToHourly(p: SeriesPoint): Date[] {
  const start = isoToDate(p.start);
  const arr: Date[] = [];
  const wholeHours = Math.max(1, Math.round(p.hours));
  for (let i = 0; i < wholeHours; i++) {
    arr.push(new Date(start.getTime() + i * 3600_000));
  }
  return arr;
}

export function aggregateForecastToDaily(grid: ForecastGridData): ForecastDaily[] {
  const dayBuckets: Record<string, { snowIn: number; pops: number[]; tMaxF?: number; tMinF?: number; tMaxC?: number; tMinC?: number }> = {};
  const pushDay = (day: string) => {
    if (!dayBuckets[day]) dayBuckets[day] = { snowIn: 0, pops: [] };
  };

  const useQpfFallback = !grid.snowfallAmount?.points?.length && grid.quantitativePrecipitation?.points?.length;
  const src = useQpfFallback ? grid.quantitativePrecipitation! : grid.snowfallAmount;
  src.points.forEach((p) => {
    const hours = Math.max(1, Math.round(p.hours));
    const inches = useQpfFallback ? toInches(p.value) * 12 : toInches(p.value);
    const perHourIn = inches / hours;
    const hoursList = expandToHourly(p);
    hoursList.forEach((h) => {
      const day = dateKeyDenver(h);
      pushDay(day);
      dayBuckets[day].snowIn += perHourIn;
    });
  });

  grid.probabilityOfPrecipitation.points.forEach((p) => {
    const hoursList = expandToHourly(p);
    hoursList.forEach((h) => {
      const day = dateKeyDenver(h);
      pushDay(day);
      dayBuckets[day].pops.push(p.value);
    });
  });

  // max/min temperature series provide one value per day (start timestamp),
  // so map each point to its calendar day directly without expanding to hourly slots.
  function pointMidpointLocalDay(p: SeriesPoint) {
    const start = isoToDate(p.start);
    const hours = Math.max(1, p.hours || 1);
    const mid = new Date(start.getTime() + (hours * 3600_000) / 2);
    return dateKeyDenver(mid);
  }

  if (grid.maxTemperature && grid.maxTemperature.points) {
    grid.maxTemperature.points.forEach((p) => {
      const day = pointMidpointLocalDay(p);
      pushDay(day);
      dayBuckets[day].tMaxC = Math.round(p.value);
      dayBuckets[day].tMaxF = Math.round(cToF(p.value));
    });
  }

  if (grid.minTemperature && grid.minTemperature.points) {
    grid.minTemperature.points.forEach((p) => {
      const day = pointMidpointLocalDay(p);
      pushDay(day);
      dayBuckets[day].tMinC = Math.round(p.value);
      dayBuckets[day].tMinF = Math.round(cToF(p.value));
    });
  }

  const days = Object.keys(dayBuckets).sort();
  return days.map((day) => {
    const b = dayBuckets[day];
    const pop = b.pops.length ? Math.round(Math.max(...b.pops)) : 0;
    const tMaxF = b.tMaxF;
    const tMinF = b.tMinF;
    const tMaxC = b.tMaxC;
    const tMinC = b.tMinC;
    return { date: day, snowIn: Number(b.snowIn.toFixed(2)), pop, tMinF, tMaxF, tMinC, tMaxC };
  });
}


export function formatDateYYYYMMDD(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export const LOCATIONS: Location[] = [
  {
    id: "alta",
    stationId: "1308",
    name: "Alta, Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "8,750 ft",
    lat: 40.59,
    lon: -111.64,
    huc: "160202040202",
    stationTriplet: "1308:UT:SNTL",
  },
  {
    id: "brighton",
    stationId: "366",
    name: "Brighton, Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "8,790 ft",
    lat: 40.6,
    lon: -111.58,
    huc: "160202040201",
    stationTriplet: "366:UT:SNTL",
  },
  {
    id: "snowbird",
    stationId: "766",
    name: "Snowbird, Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "9,170 ft",
    lat: 40.57,
    lon: -111.66,
    huc: "160202040202",
    stationTriplet: "766:UT:SNTL",
  },
  {
    id: "parkcity",
    stationId: "814",
    name: "Park City, Utah",
    network: "SNOTEL",
    county: "Summit",
    elevation: "9,260 ft",
    lat: 40.62,
    lon: -111.53,
    huc: "160201020101",
    stationTriplet: "814:UT:SNTL",
  },
  {
    id: "triallake",
    stationId: "828",
    name: "Trial Lake, Utah",
    network: "SNOTEL",
    county: "Summit",
    elevation: "9,970 ft",
    lat: 40.68,
    lon: -110.95,
    huc: "160202030102",
    stationTriplet: "828:UT:SNTL",
  },
  {
    id: "wolfcreekpeak",
    stationId: "1164",
    name: "Wolf Creek Peak, Utah",
    network: "SNOTEL",
    county: "Wasatch",
    elevation: "9,770 ft",
    lat: 40.48,
    lon: -111.04,
    huc: "160202030104",
    stationTriplet: "1164:UT:SNTL",
  },
  {
    id: "strawberrydivide",
    stationId: "795",
    name: "Strawberry Divide, Utah",
    network: "SNOTEL",
    county: "Wasatch",
    elevation: "8,100 ft",
    lat: 40.16,
    lon: -111.21,
    huc: "140600040103",
    stationTriplet: "795:UT:SNTL",
  },
  {
    id: "powdermountain",
    stationId: "1300",
    name: "Powder Mountain, Utah",
    network: "SNOTEL",
    county: "Cache",
    elevation: "8,490 ft",
    lat: 41.37,
    lon: -111.77,
    huc: "160102030102",
    stationTriplet: "1300:UT:SNTL",
  },
  
];
