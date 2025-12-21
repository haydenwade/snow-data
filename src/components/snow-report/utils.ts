export type Unit = "in" | "mm";

export type HistoricDay = {
  date: string;
  snowDepth: number | null;
  swe: number | null;
  derivedSnowfallIn: number;
  startSnowDepth?: number | null;
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

export function deriveDailySnowfall(historic: { date: string; snowDepth: number | null; swe: number | null }[]): HistoricDay[] {
  const out: HistoricDay[] = [];
  for (let i = 0; i < historic.length; i++) {
    const cur = historic[i];
    const prev = historic[i - 1];
    let derived = 0;
    if (prev) {
      const dSnwd = cur.snowDepth != null && prev.snowDepth != null ? cur.snowDepth - prev.snowDepth : 0;
      const dSwe = cur.swe != null && prev.swe != null ? cur.swe - prev.swe : 0;
      if (dSnwd > 0) derived = dSnwd;
      else if (dSwe > 0) derived = dSwe * 12;
    }
    const startSnow = prev ? prev.snowDepth ?? null : cur.snowDepth ?? null;
    out.push({ date: cur.date, snowDepth: cur.snowDepth, swe: cur.swe, derivedSnowfallIn: Number(Math.max(0, derived).toFixed(2)), startSnowDepth: startSnow });
  }
  return out;
}

export function formatDateYYYYMMDD(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}
