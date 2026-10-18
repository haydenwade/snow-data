import { SnowDepthPointResponse } from "@/types/imagery";

// NOAA NOHRSC National Snow Analysis (SNODAS model output), CONUS only, latest
// analysis only. Snow depth image is layer 3 (meters), SWE image is layer 7 (mm).
export const NOHRSC_SNOW_ANALYSIS_URL =
  "https://mapservices.weather.noaa.gov/raster/rest/services/snow/NOHRSC_Snow_Analysis/MapServer";

const DEPTH_IMAGE_LAYER = 3;
const DEPTH_FOOTPRINT_LAYER = 2;
const SWE_IMAGE_LAYER = 7;
const METERS_TO_INCHES = 39.3701;
const MM_TO_INCHES = 1 / 25.4;
const CACHE_SECONDS = 1800;

type IdentifyResult = {
  layerId?: number;
  attributes?: Record<string, string | undefined>;
};

function pixelValue(result: IdentifyResult | undefined) {
  const raw = result?.attributes?.["Service Pixel Value"];
  if (raw == null || raw === "" || raw === "NoData") return null;
  const numeric = Number(raw);
  // Cells outside the modeled area carry a large negative no-data value.
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function parseValidTime(raw: string | undefined) {
  if (!raw) return null;
  // "10/18/2026 12:00:00 PM" in UTC
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/);
  if (!match) return null;
  const [, month, day, year, hourText, minute, second, meridiem] = match;
  let hour = Number(hourText) % 12;
  if (meridiem === "PM") hour += 12;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), hour, Number(minute), Number(second)),
  );
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function fetchSnowDepthAtPoint(
  latitude: number,
  longitude: number,
): Promise<SnowDepthPointResponse> {
  const delta = 0.05;
  const params = new URLSearchParams({
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    sr: "4326",
    layers: `all:${DEPTH_FOOTPRINT_LAYER},${DEPTH_IMAGE_LAYER},${SWE_IMAGE_LAYER}`,
    tolerance: "0",
    mapExtent: `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`,
    imageDisplay: "100,100,96",
    returnGeometry: "false",
    f: "json",
  });

  const response = await fetch(`${NOHRSC_SNOW_ANALYSIS_URL}/identify?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`NOHRSC snow analysis request failed (${response.status})`);
  }

  const json = (await response.json()) as { results?: IdentifyResult[]; error?: unknown };
  if (json.error) throw new Error("NOHRSC snow analysis returned an error");
  const results = Array.isArray(json.results) ? json.results : [];
  const depthImage = results.find((r) => r.layerId === DEPTH_IMAGE_LAYER);
  const sweImage = results.find((r) => r.layerId === SWE_IMAGE_LAYER);
  const footprint = results.find((r) => r.layerId === DEPTH_FOOTPRINT_LAYER);

  const depthMeters = pixelValue(depthImage);
  const sweMm = pixelValue(sweImage);
  if (!footprint || (depthMeters == null && sweMm == null)) {
    return { covered: false, depthIn: null, sweIn: null, validTime: null };
  }

  return {
    covered: true,
    depthIn: depthMeters == null ? null : Number((depthMeters * METERS_TO_INCHES).toFixed(1)),
    sweIn: sweMm == null ? null : Number((sweMm * MM_TO_INCHES).toFixed(1)),
    validTime: parseValidTime(footprint.attributes?.idp_validtime),
  };
}
