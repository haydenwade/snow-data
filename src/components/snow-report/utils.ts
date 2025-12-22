export type Unit = "in" | "mm";

export type GenericLink = {
  label: string;
  url: string;
};

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
  logoUrl?: string;
  socialMediaLinks: GenericLink[];
  resortInfoLinks: GenericLink[];
  avalancheInfoLinks: GenericLink[];
  trafficInfoLinks: GenericLink[];
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
  grid: ForecastGridData
): ForecastDaily[] {
  const dayBuckets: Record<
    string,
    {
      snowIn: number;
      pops: number[];
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

  // wind speed/direction and sky cover - expand to hourly and collect
  if (grid.windSpeed && grid.windSpeed.points) {
    grid.windSpeed.points.forEach((p) => {
      const hoursList = expandToHourly(p);
      hoursList.forEach((h) => {
        const day = dateKeyDenver(h);
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
        const day = dateKeyDenver(h);
        pushDay(day);
        dayBuckets[day].windDirs.push({ dir: p.value, speed: 0 });
      });
    });
  }

  if (grid.skyCover && grid.skyCover.points) {
    grid.skyCover.points.forEach((p) => {
      const hoursList = expandToHourly(p);
      hoursList.forEach((h) => {
        const day = dateKeyDenver(h);
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

export const LOCATIONS: Location[] = [
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
    logoUrl: "/parkcity-logo.png",
    stationTriplet: "814:UT:SNTL",
    socialMediaLinks: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/pcski/",
      },
      { label: "X", url: "https://x.com/pcski" },
    ],
    resortInfoLinks: [
      {
        label: "PC Mtn Alerts (Twitter/X)",
        url: "https://x.com/PCMtnAlert",
      },
      {
        label: "Lift and Terrain Status",
        url: "https://www.parkcitymountain.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx",
      },
      {
        label: "Hours of Operation",
        url: "https://www.parkcitymountain.com/explore-the-resort/about-the-resort/hours-of-operation.aspx",
      },
      {
        label: "Mountain Cameras",
        url: "https://www.parkcitymountain.com/the-mountain/mountain-conditions/mountain-cams.aspx",
      },
      {
        label: "Trail Map",
        url: "https://www.parkcitymountain.com/the-mountain/about-the-mountain/trail-map.aspx",
      },
      {
        label: "Parking",
        url: "https://www.parkcitymountain.com/explore-the-resort/about-the-resort/getting-here.aspx",
      },

      // {
      //   label: "Doppler Radar | NWS",
      //   url: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MzMsNDAuNTE1XSwiem9vbSI6OCwibG9jYXRpb24iOlstMTExLjY0LDQwLjU5XX0sImJhc2UiOiJzdGFuZGFyZCIsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlfQ%3D%3D#/",
      // },
    ],
    trafficInfoLinks: [
      {
        label: "Parley's Canyon Traffic Info | UDOT on X",
        url: "https://x.com/wasatchbackudot",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/salt-lake",
      },
    ],
  },
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
    logoUrl: "/alta-logo.png",
    stationTriplet: "1308:UT:SNTL",
    socialMediaLinks: [],
    resortInfoLinks: [
      {
        label: "Resort Info and Conditions",
        url: "https://www.alta.com/weather",
      },
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/salt-lake",
      },
      {
        label: "Doppler Radar | NWS",
        url: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MzMsNDAuNTE1XSwiem9vbSI6OCwibG9jYXRpb24iOlstMTExLjY0LDQwLjU5XX0sImJhc2UiOiJzdGFuZGFyZCIsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlfQ%3D%3D#/",
      },
      {
        label: "7-day Forecast | NOAA",
        url: "https://forecast.weather.gov/MapClick.php?lon=-111.63439750671387&lat=40.57318341334175",
      },
      {
        label: "Traffic Cameras | UDOT",
        url: "https://cottonwoodcanyons.udot.utah.gov/road-information/#traffic-cameras",
      },
    ],
    avalancheInfoLinks: [],
    trafficInfoLinks: [],
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
    logoUrl: "/snowbird-logo.png",
    stationTriplet: "766:UT:SNTL",
    socialMediaLinks: [],
    resortInfoLinks: [
      {
        label: "Resort Info and Conditions",
        url: "https://www.snowbird.com/the-mountain/mountain-report/current-conditions-weather/",
      },
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/salt-lake",
      },
      {
        label: "Doppler Radar | NWS",
        url: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MzMsNDAuNTE1XSwiem9vbSI6OCwibG9jYXRpb24iOlstMTExLjY0LDQwLjU5XX0sImJhc2UiOiJzdGFuZGFyZCIsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlfQ%3D%3D#/",
      },
      {
        label: "7-day Forecast | NOAA",
        url: "https://forecast.weather.gov/MapClick.php?lat=40.582&lon=-111.6562#.YWhkfxDMI1I",
      },
      {
        label: "Traffic Cameras | UDOT",
        url: "https://cottonwoodcanyons.udot.utah.gov/road-information/#traffic-cameras",
      },
    ],
    avalancheInfoLinks: [],
    trafficInfoLinks: [],
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
    logoUrl: "/brighton-logo.png",
    stationTriplet: "366:UT:SNTL",
    socialMediaLinks: [],
    resortInfoLinks: [
      {
        label: "Resort Info and Conditions",
        url: "https://www.brightonresort.com/conditions",
      },
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/salt-lake",
      },
      {
        label: "Doppler Radar | NWS",
        url: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MzMsNDAuNTE1XSwiem9vbSI6OCwibG9jYXRpb24iOlstMTExLjY0LDQwLjU5XX0sImJhc2UiOiJzdGFuZGFyZCIsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlfQ%3D%3D#/",
      },
      {
        label: "Traffic Cameras | UDOT",
        url: "https://cottonwoodcanyons.udot.utah.gov/road-information/#traffic-cameras",
      },
    ],
    avalancheInfoLinks: [],
    trafficInfoLinks: [],
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
    logoUrl: "/powdermtn-logo.svg",
    stationTriplet: "1300:UT:SNTL",
    socialMediaLinks: [],
    resortInfoLinks: [
      {
        label: "Resort Info and Conditions",
        url: "https://powdermountain.com/conditions",
      },
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/ogden",
      },
      {
        label: "Doppler Radar | NWS",
        url: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MzMsNDAuNTE1XSwiem9vbSI6OCwibG9jYXRpb24iOlstMTExLjY0LDQwLjU5XX0sImJhc2UiOiJzdGFuZGFyZCIsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlfQ%3D%3D#/",
      },
    ],
    avalancheInfoLinks: [],
    trafficInfoLinks: [],
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
    socialMediaLinks: [],
    resortInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/uintas",
      },
      {
        label: "Doppler Radar | NWS",
        url: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MzMsNDAuNTE1XSwiem9vbSI6OCwibG9jYXRpb24iOlstMTExLjY0LDQwLjU5XX0sImJhc2UiOiJzdGFuZGFyZCIsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlfQ%3D%3D#/",
      },
    ],
    avalancheInfoLinks: [],
    trafficInfoLinks: [],
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
    socialMediaLinks: [],
    resortInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/uintas",
      },
      {
        label: "Doppler Radar | NWS",
        url: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MzMsNDAuNTE1XSwiem9vbSI6OCwibG9jYXRpb24iOlstMTExLjY0LDQwLjU5XX0sImJhc2UiOiJzdGFuZGFyZCIsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlfQ%3D%3D#/",
      },
    ],
    avalancheInfoLinks: [],
    trafficInfoLinks: [],
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
    socialMediaLinks: [],
    resortInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/uintas",
      },
      {
        label: "Doppler Radar | NWS",
        url: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MzMsNDAuNTE1XSwiem9vbSI6OCwibG9jYXRpb24iOlstMTExLjY0LDQwLjU5XX0sImJhc2UiOiJzdGFuZGFyZCIsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlfQ%3D%3D#/",
      },
    ],
    avalancheInfoLinks: [],
    trafficInfoLinks: [],
  },
];
