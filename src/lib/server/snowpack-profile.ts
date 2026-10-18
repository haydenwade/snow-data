import { SnowpackProfileResponse, SnowpackProfileStation } from "@/types/imagery";
import { fetchAwdbJson, toIsoDate } from "./awdb";
import {
  AwdbStation,
  fetchStationsByStateCodes,
  findLocationByTriplet,
  toMountainLocation,
} from "./stations";

export const SNOWPACK_PROFILE_RADIUS_MILES = 30;
const MAX_STATIONS = 12;
const LOOKBACK_DAYS = 3;

type SnowDepthResponse = Array<{
  stationTriplet?: string;
  data?: Array<{ values?: Array<{ date?: string; value?: number | null }> }>;
}>;

function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function latestDepth(values: Array<{ date?: string; value?: number | null }> = []) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const entry = values[index];
    if (typeof entry?.value === "number" && Number.isFinite(entry.value) && entry.date) {
      return { value: Math.max(0, entry.value), date: entry.date.slice(0, 10) };
    }
  }
  return null;
}

/** Latest SNOTEL snow depth at stations near `station`, for a depth-vs-elevation view. */
export async function fetchSnowpackProfile(station: AwdbStation): Promise<SnowpackProfileResponse> {
  const lat = station.latitude;
  const lon = station.longitude;
  if (lat == null || lon == null) {
    return { radiusMiles: SNOWPACK_PROFILE_RADIUS_MILES, stations: [] };
  }

  const candidates = (await fetchStationsByStateCodes([station.stateCode]))
    .filter((s) => s.elevation != null && s.latitude != null && s.longitude != null)
    .map((s) => ({ station: s, miles: distanceMiles(lat, lon, s.latitude!, s.longitude!) }))
    .filter((entry) => entry.miles <= SNOWPACK_PROFILE_RADIUS_MILES)
    .sort((a, b) => a.miles - b.miles)
    .slice(0, MAX_STATIONS);

  if (candidates.length === 0) {
    return { radiusMiles: SNOWPACK_PROFILE_RADIUS_MILES, stations: [] };
  }

  const end = new Date();
  const begin = new Date(end);
  begin.setDate(begin.getDate() - LOOKBACK_DAYS);
  const json = await fetchAwdbJson<SnowDepthResponse>("/data", {
    stationTriplets: candidates.map((c) => c.station.stationTriplet).join(","),
    elements: "SNWD",
    duration: "DAILY",
    beginDate: toIsoDate(begin),
    endDate: toIsoDate(end),
    unitSystem: "ENGLISH",
  });

  const depthByTriplet = new Map<string, { value: number; date: string }>();
  for (const record of Array.isArray(json) ? json : []) {
    const depth = latestDepth(record.data?.[0]?.values);
    if (record.stationTriplet && depth) depthByTriplet.set(record.stationTriplet, depth);
  }

  const stations: SnowpackProfileStation[] = candidates.flatMap(({ station: s, miles }) => {
    const depth = depthByTriplet.get(s.stationTriplet);
    if (!depth) return [];
    const location = toMountainLocation(s, findLocationByTriplet(s.stationTriplet));
    return [
      {
        id: location.id,
        name: location.name,
        elevationFt: Math.round(s.elevation!),
        distanceMiles: Number(miles.toFixed(1)),
        snowDepthIn: depth.value,
        observedDate: depth.date,
        isCurrentStation: s.stationTriplet === station.stationTriplet,
      },
    ];
  });

  stations.sort((a, b) => a.elevationFt - b.elevationFt);
  return { radiusMiles: SNOWPACK_PROFILE_RADIUS_MILES, stations };
}
