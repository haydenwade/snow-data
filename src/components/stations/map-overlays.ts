import { addDaysToIsoDate } from "@/components/stations/avalanche-archive-date";

// Keyless overlays drawn on top of the basemap. NASA GIBS tiles are
// public domain; NOAA NOHRSC renders SNODAS tiles on request.
const TILE_SIZE = 256;
const GIBS_WMTS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";
const NOHRSC_EXPORT =
  "https://mapservices.weather.noaa.gov/raster/rest/services/snow/NOHRSC_Snow_Analysis/MapServer/export";
const WEB_MERCATOR_HALF_WORLD = 20037508.342789244;

export type SatelliteMode = "off" | "snow-cover" | "true-color" | "hls";

export const SATELLITE_MODE_OPTIONS: Array<{
  key: Exclude<SatelliteMode, "off">;
  label: string;
  detail: string;
}> = [
  { key: "snow-cover", label: "Snow cover", detail: "Daily · 375 m" },
  { key: "true-color", label: "True color", detail: "Daily · 250 m" },
  { key: "hls", label: "30 m", detail: "Every 2–3 days" },
];

export function isSatelliteMode(value: string | null | undefined): value is SatelliteMode {
  return value === "snow-cover" || value === "true-color" || value === "hls";
}

export type OverlaySource = {
  id: string;
  /** Deepest zoom the source has tiles for; deeper map zooms scale these up. */
  maxLevel: number;
  opacity: number;
  tileUrl: (z: number, x: number, y: number) => string;
};

export type OverlayTile = {
  key: string;
  url: string;
  left: number;
  top: number;
  size: number;
};

function gibsSource(id: string, layer: string, date: string, maxLevel: number, format: "png" | "jpg", opacity: number): OverlaySource {
  return {
    id: `${id}-${date}`,
    maxLevel,
    opacity,
    tileUrl: (z, x, y) =>
      `${GIBS_WMTS}/${layer}/default/${date}/GoogleMapsCompatible_Level${maxLevel}/${z}/${y}/${x}.${format}`,
  };
}

export function satelliteOverlaySources(mode: SatelliteMode, date: string): OverlaySource[] {
  if (mode === "snow-cover") {
    return [gibsSource("viirs-snow", "VIIRS_NOAA20_NDSI_Snow_Cover", date, 8, "png", 0.8)];
  }
  if (mode === "true-color") {
    return [gibsSource("viirs-true", "VIIRS_NOAA20_CorrectedReflectance_TrueColor", date, 9, "jpg", 1)];
  }
  if (mode === "hls") {
    // Both missions for the day; GIBS returns transparent tiles where a mission has no pass.
    return [
      gibsSource("hls-l30", "HLS_L30_Nadir_BRDF_Adjusted_Reflectance", date, 12, "png", 1),
      gibsSource("hls-s30", "HLS_S30_Nadir_BRDF_Adjusted_Reflectance", date, 12, "png", 1),
    ];
  }
  return [];
}

function tileBbox3857(z: number, x: number, y: number) {
  const span = (2 * WEB_MERCATOR_HALF_WORLD) / 2 ** z;
  const west = -WEB_MERCATOR_HALF_WORLD + x * span;
  const north = WEB_MERCATOR_HALF_WORLD - y * span;
  return [west, north - span, west + span, north].join(",");
}

/** NOAA SNODAS modeled snow depth, latest analysis only. */
export const SNOW_DEPTH_OVERLAY: OverlaySource = {
  id: "snodas-depth",
  maxLevel: 11,
  opacity: 0.75,
  tileUrl: (z, x, y) =>
    `${NOHRSC_EXPORT}?bbox=${tileBbox3857(z, x, y)}&bboxSR=3857&imageSR=3857&size=${TILE_SIZE},${TILE_SIZE}&format=png32&transparent=true&layers=show:3&f=image`,
};

/**
 * Map the basemap's visible tiles onto an overlay source. Past the source's
 * deepest level, one parent tile is drawn larger to cover several map tiles.
 */
export function overlayTilesFor(
  source: OverlaySource,
  mapTiles: Array<{ x: number; y: number; left: number; top: number }>,
  zoom: number,
): OverlayTile[] {
  const level = Math.min(zoom, source.maxLevel);
  const factor = 2 ** (zoom - level);
  const seen = new Set<string>();
  const tiles: OverlayTile[] = [];
  for (const tile of mapTiles) {
    const sourceX = Math.floor(tile.x / factor);
    const sourceY = Math.floor(tile.y / factor);
    const left = tile.left - (tile.x % factor) * TILE_SIZE;
    const top = tile.top - (tile.y % factor) * TILE_SIZE;
    const key = `${source.id}-${level}-${sourceX}-${sourceY}-${Math.round(left)}-${Math.round(top)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    tiles.push({ key, url: source.tileUrl(level, sourceX, sourceY), left, top, size: TILE_SIZE * factor });
  }
  return tiles;
}

/**
 * GIBS daily mosaics for the current day fill in through the day, so "today"
 * on the map shows yesterday's complete mosaic.
 */
export function dailyImageryDate(mapDate: string | null, today: string) {
  return mapDate ?? addDaysToIsoDate(today, -1) ?? today;
}

export const SNOW_COVER_LEGEND = {
  title: "Snow cover (NDSI)",
  gradient: "linear-gradient(to right, rgb(240,240,128), rgb(240,180,137), rgb(240,128,129), rgb(255,0,0))",
  lowLabel: "Patchy",
  highLabel: "Full",
  note: "Clouds and bare ground show no color — check True color.",
};

// NOHRSC class breaks (inches) and colors from the service legend.
export const SNOW_DEPTH_LEGEND: Array<{ label: string; color: string }> = [
  { label: "<2", color: "#abc1bf" },
  { label: "2–4", color: "#66c1c4" },
  { label: "4–10", color: "#63a9cb" },
  { label: "10–20", color: "#5079c8" },
  { label: "20–39", color: "#3c3fc2" },
  { label: "39–59", color: "#5720c3" },
  { label: "59–98", color: "#7d01bb" },
  { label: "98+", color: "#b404b1" },
];
