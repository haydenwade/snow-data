import { ForecastDaily, ForecastGridData, SeriesPoint } from "@/types/forecast";

// Return YYYY-MM-DD string for a given date in the provided IANA time zone
export function dateKeyInZone(d: Date, timeZone: string = "America/Denver") {
  return d.toLocaleDateString("en-CA", { timeZone });
}

export function isoToDate(iso: string) {
  return new Date(iso);
}

export function toInches(mm: number) {
  return mm / 25.4;
}

//TODO: consolidate - two versions of this function exist
export function cToF(c: number) {
  return (c * 9) / 5 + 32;
}

export function degToCompass(deg?: number) {
  if (deg == null || Number.isNaN(deg)) return "";
  const idx = Math.round((deg % 360) / 45) % 8;
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][idx];
}

export function skyCoverLabel(p?: number) {
  if (p == null || Number.isNaN(p)) return "—";
  if (p <= 10) return "Clear";
  if (p <= 35) return "Mostly Sunny";
  if (p <= 65) return "Partly Cloudy";
  if (p <= 90) return "Mostly Cloudy";
  return "Overcast";
}

export function formatObservedLabel(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

export function celsiusFromF(f: number) {
  return Math.round(((f - 32) * 5) / 9);
}

export function kphFromMph(mph: number) {
  return Math.round(mph * 1.60934);
}


export function formatTimeInZone(
  iso?: string | Date | null,
  timeZone?: string | null
) {
  if (!iso) return null;
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  try {
    return d.toLocaleTimeString(undefined, {
      timeZone: timeZone ?? undefined,
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
}



export function parseValidTime(validTime: string): {
  start: string;
  hours: number;
} {
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

export function aggregateForecastToDaily(
  grid: ForecastGridData,
  timeZone: string
): ForecastDaily[] {
  const dayBuckets: Record<
    string,
    {
      snowIn: number;
      pops: number[];
      tempsC: number[];
      windSpeeds: number[];
      windDirs: { dir: number; speed: number }[];
      skyCovers: number[];
      tMaxF?: number;
      tMinF?: number;
      tMaxC?: number;
      tMinC?: number;
    }
  > = {};
  const pushDay = (day: string) => {
    if (!dayBuckets[day])
      dayBuckets[day] = {
        snowIn: 0,
        pops: [],
        tempsC: [],
        windSpeeds: [],
        windDirs: [],
        skyCovers: [],
      };
  };

  const useQpfFallback =
    !grid.snowfallAmount?.points?.length &&
    grid.quantitativePrecipitation?.points?.length;
  const src = useQpfFallback
    ? grid.quantitativePrecipitation!
    : grid.snowfallAmount;
  src.points.forEach((p) => {
    const hours = Math.max(1, Math.round(p.hours));
    const inches = useQpfFallback ? toInches(p.value) * 12 : toInches(p.value);
    const perHourIn = inches / hours;
    const hoursList = expandToHourly(p);
    hoursList.forEach((h) => {
      const day = dateKeyInZone(h, timeZone);
      pushDay(day);
      dayBuckets[day].snowIn += perHourIn;
    });
  });

  grid.probabilityOfPrecipitation.points.forEach((p) => {
    const hoursList = expandToHourly(p);
    hoursList.forEach((h) => {
      const day = dateKeyInZone(h, timeZone);
      pushDay(day);
      dayBuckets[day].pops.push(p.value);
    });
  });

  if (grid.temperature2m && grid.temperature2m.points) {
    grid.temperature2m.points.forEach((p) => {
      const hoursList = expandToHourly(p);
      hoursList.forEach((h) => {
        const day = dateKeyInZone(h, timeZone);
        pushDay(day);
        dayBuckets[day].tempsC.push(p.value);
      });
    });
  }

  // wind speed/direction and sky cover - expand to hourly and collect
  if (grid.windSpeed && grid.windSpeed.points) {
    grid.windSpeed.points.forEach((p) => {
      const hoursList = expandToHourly(p);
      hoursList.forEach((h) => {
        const day = dateKeyInZone(h, timeZone);
        pushDay(day);
        // store raw value for later normalization
        dayBuckets[day].windSpeeds.push(p.value);
      });
    });
  }

  if (grid.windDirection && grid.windDirection.points) {
    grid.windDirection.points.forEach((p) => {
      const hoursList = expandToHourly(p);
      hoursList.forEach((h) => {
        const day = dateKeyInZone(h, timeZone);
        pushDay(day);
        dayBuckets[day].windDirs.push({ dir: p.value, speed: 0 });
      });
    });
  }

  if (grid.skyCover && grid.skyCover.points) {
    grid.skyCover.points.forEach((p) => {
      const hoursList = expandToHourly(p);
      hoursList.forEach((h) => {
        const day = dateKeyInZone(h, timeZone);
        pushDay(day);
        dayBuckets[day].skyCovers.push(p.value);
      });
    });
  }

  // max/min temperature series provide one value per day (start timestamp),
  // so map each point to its calendar day directly without expanding to hourly slots.
  function pointMidpointLocalDay(p: SeriesPoint) {
    const start = isoToDate(p.start);
    const hours = Math.max(1, p.hours || 1);
    const mid = new Date(start.getTime() + (hours * 3600_000) / 2);
    return dateKeyInZone(mid, timeZone);
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
    let tMaxF = b.tMaxF;
    let tMinF = b.tMinF;
    let tMaxC = b.tMaxC;
    let tMinC = b.tMinC;
    if ((tMaxC == null || tMinC == null) && b.tempsC.length > 0) {
      const minObservedC = Math.min(...b.tempsC);
      const maxObservedC = Math.max(...b.tempsC);
      if (tMinC == null) tMinC = Math.round(minObservedC);
      if (tMaxC == null) tMaxC = Math.round(maxObservedC);
      if (tMinF == null) tMinF = Math.round(cToF(minObservedC));
      if (tMaxF == null) tMaxF = Math.round(cToF(maxObservedC));
    }
    // compute average wind speed: values from grid.windSpeed are treated as km/h
    let windMph: number | undefined = undefined;
    if (b.windSpeeds && b.windSpeeds.length) {
      const sum = b.windSpeeds.reduce(
        (s, v) => s + (Number.isFinite(v) ? v : 0),
        0
      );
      const avgKph = sum / b.windSpeeds.length;
      // convert km/h to mph
      windMph = Math.round(avgKph * 0.621371);
    }

    // weighted average wind direction (vector average)
    let windDirDeg: number | undefined = undefined;
    if (b.windDirs && b.windDirs.length) {
      const dirs = b.windDirs.map((wd, i) => ({
        dir: wd.dir,
        speed: b.windSpeeds[i] ?? 1,
      }));
      let x = 0;
      let y = 0;
      dirs.forEach((d) => {
        const rad = (d.dir * Math.PI) / 180;
        const w = d.speed || 1;
        x += Math.cos(rad) * w;
        y += Math.sin(rad) * w;
      });
      if (x !== 0 || y !== 0) {
        const ang = (Math.atan2(y, x) * 180) / Math.PI;
        windDirDeg = Math.round((ang + 360) % 360);
      }
    }

    let skyCoverPercent: number | undefined = undefined;
    if (b.skyCovers && b.skyCovers.length) {
      const sum = b.skyCovers.reduce(
        (s, v) => s + (Number.isFinite(v) ? v : 0),
        0
      );
      skyCoverPercent = Math.round(sum / b.skyCovers.length);
    }

    return {
      date: day,
      snowIn: Number(b.snowIn.toFixed(2)),
      pop,
      windMph,
      windDirDeg,
      skyCoverPercent,
      tMinF,
      tMaxF,
      tMinC,
      tMaxC,
    };
  });
}

export function formatDateYYYYMMDD(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

