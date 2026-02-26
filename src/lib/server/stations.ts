import { LOCATIONS } from "@/constants/locations";
import {
  normalizeStationKeyInput,
  stationKeyToTriplet,
  stationTripletToKey,
} from "@/lib/station-key";
import { normalizeTripletInput } from "@/lib/station-triplet";
import { MountainLocation } from "@/types/location";
import { StationSummary } from "@/types/station";
import { fetchAwdbJson } from "./awdb";

export type AwdbStation = {
  stationTriplet: string;
  stationId: string;
  stateCode: string;
  networkCode: string;
  name: string;
  countyName?: string | null;
  huc?: string | null;
  elevation?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  dataTimeZone?: number | null;
};

const STATE_NAME_BY_CODE: Record<string, string> = {
  AK: "Alaska",
  AB: "Alberta",
  AZ: "Arizona",
  BC: "British Columbia",
  CA: "California",
  CO: "Colorado",
  ID: "Idaho",
  MB: "Manitoba",
  MT: "Montana",
  NM: "New Mexico",
  NT: "Northwest Territories",
  NU: "Nunavut",
  NV: "Nevada",
  ON: "Ontario",
  OR: "Oregon",
  QC: "Quebec",
  SD: "South Dakota",
  SK: "Saskatchewan",
  UT: "Utah",
  WA: "Washington",
  WY: "Wyoming",
  YK: "Yukon",
  ND: "North Dakota",
  NE: "Nebraska",
};

const DEFAULT_TZ_BY_STATE: Record<string, string> = {
  AK: "America/Anchorage",
  AB: "America/Edmonton",
  AZ: "America/Phoenix",
  BC: "America/Vancouver",
  CA: "America/Los_Angeles",
  CO: "America/Denver",
  ID: "America/Boise",
  MB: "America/Winnipeg",
  MT: "America/Denver",
  NM: "America/Denver",
  NT: "America/Yellowknife",
  NU: "America/Iqaluit",
  NV: "America/Los_Angeles",
  ON: "America/Toronto",
  OR: "America/Los_Angeles",
  QC: "America/Montreal",
  SD: "America/Chicago",
  SK: "America/Regina",
  UT: "America/Denver",
  WA: "America/Los_Angeles",
  WY: "America/Denver",
  YK: "America/Whitehorse",
  ND: "America/Chicago",
  NE: "America/Chicago",
};

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function normalizeStateCodes(raw: string | null | undefined) {
  const parsed = (raw ?? "")
    .split(",")
    .map((part) => part.trim().toUpperCase())
    .filter((part) => /^[A-Z]{2}$/.test(part));
  return unique(parsed);
}

const STATION_CACHE_TTL_MS = 15 * 60 * 1000;
const stationStateCache = new Map<
  string,
  { expiresAt: number; data: AwdbStation[] }
>();

function fallbackTimeZoneFromOffset(offsetHours: number | null | undefined) {
  if (offsetHours == null || Number.isNaN(offsetHours)) return "UTC";
  const rounded = Math.trunc(offsetHours);
  const sign = rounded <= 0 ? "+" : "-";
  return `Etc/GMT${sign}${Math.abs(rounded)}`;
}

function formatElevation(elevationFt: number | null | undefined) {
  if (elevationFt == null || Number.isNaN(elevationFt)) return "Unknown";
  return `${Math.round(elevationFt).toLocaleString("en-US")} ft`;
}

function buildDefaultRadarLink(lat: number, lon: number) {
  const settings = {
    agenda: {
      id: "weather",
      center: [lon, lat],
      location: [lon, lat],
      zoom: 7,
      layer: "bref_qcd",
    },
    animating: false,
    base: "standard",
    artcc: false,
    county: false,
    cwa: false,
    rfc: false,
    state: false,
    menu: true,
    shortFusedOnly: false,
    opacity: {
      alerts: 0.8,
      local: 0.6,
      localStations: 0.8,
      national: 0.6,
    },
  };
  const encodedSettings = Buffer.from(JSON.stringify(settings), "utf-8").toString(
    "base64",
  );
  return `https://radar.weather.gov/?settings=v1_${encodeURIComponent(
    encodedSettings,
  )}`;
}

export function stateNameFromCode(stateCode: string) {
  const code = stateCode.toUpperCase();
  return STATE_NAME_BY_CODE[code] ?? code;
}

export function findLocationByTriplet(stationTriplet: string) {
  const normalized = stationTriplet.toUpperCase();
  return (
    LOCATIONS.find((loc) => loc.stationTriplet.toUpperCase() === normalized) ??
    null
  );
}

export function findLocationById(locationId: string) {
  const normalized = normalizeStationKeyInput(locationId);
  if (!normalized) return null;
  return LOCATIONS.find((location) => location.id.toLowerCase() === normalized) ?? null;
}

export function resolveTripletFromStationKey(stationKey: string) {
  const normalizedKey = normalizeStationKeyInput(stationKey);
  if (!normalizedKey) return null;

  const locationMatch = findLocationById(normalizedKey);
  if (locationMatch) {
    return normalizeTripletInput(locationMatch.stationTriplet);
  }

  return stationKeyToTriplet(normalizedKey);
}

export function inferTimeZone(
  station: Pick<AwdbStation, "stateCode" | "dataTimeZone">,
  locationMatch: MountainLocation | null,
) {
  if (locationMatch?.timezone) return locationMatch.timezone;
  const byState = DEFAULT_TZ_BY_STATE[(station.stateCode ?? "").toUpperCase()];
  if (byState) return byState;
  return fallbackTimeZoneFromOffset(station.dataTimeZone ?? null);
}

export function toStationSummary(
  station: AwdbStation,
  locationMatch: MountainLocation | null,
): StationSummary {
  const derivedStationKey =
    stationTripletToKey(station.stationTriplet) ??
    `${station.stationId}-${station.stateCode}-${station.networkCode}`.toLowerCase();
  const stationKey =
    locationMatch?.id ?? derivedStationKey;

  return {
    stationKey,
    stationTriplet: station.stationTriplet,
    stationId: station.stationId,
    stateCode: station.stateCode,
    stateName: stateNameFromCode(station.stateCode),
    networkCode: station.networkCode,
    name: station.name,
    countyName: station.countyName ?? "Unknown",
    huc: station.huc ?? null,
    elevationFt:
      station.elevation == null || Number.isNaN(station.elevation)
        ? null
        : station.elevation,
    latitude: station.latitude ?? 0,
    longitude: station.longitude ?? 0,
    dataTimeZone:
      station.dataTimeZone == null || Number.isNaN(station.dataTimeZone)
        ? null
        : station.dataTimeZone,
    logoUrl: locationMatch?.logoUrl ?? null,
    hasLocationDetails: Boolean(locationMatch),
  };
}

export function toMountainLocation(
  station: AwdbStation,
  locationMatch: MountainLocation | null,
): MountainLocation {
  const latitude =
    locationMatch?.lat ??
    (station.latitude == null || Number.isNaN(station.latitude)
      ? 0
      : station.latitude);
  const longitude =
    locationMatch?.lon ??
    (station.longitude == null || Number.isNaN(station.longitude)
      ? 0
      : station.longitude);

  return {
    id:
      locationMatch?.id ??
      stationTripletToKey(station.stationTriplet) ??
      `station-${station.stationId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    stationId: station.stationId,
    name: locationMatch?.name ?? station.name,
    city: locationMatch?.city ?? station.countyName ?? stateNameFromCode(station.stateCode),
    state: locationMatch?.state ?? stateNameFromCode(station.stateCode),
    network: locationMatch?.network ?? station.networkCode,
    county: locationMatch?.county ?? station.countyName ?? "Unknown",
    elevation: locationMatch?.elevation ?? formatElevation(station.elevation),
    lat: latitude,
    lon: longitude,
    huc: locationMatch?.huc ?? station.huc ?? "Unknown",
    timezone: inferTimeZone(station, locationMatch),
    stationTriplet: locationMatch?.stationTriplet ?? station.stationTriplet,
    logoUrl: locationMatch?.logoUrl,
    socialMediaLinks: locationMatch?.socialMediaLinks ?? [],
    resortInfoLinks: locationMatch?.resortInfoLinks ?? [],
    trafficInfoLinks: locationMatch?.trafficInfoLinks ?? [],
    radarLink: buildDefaultRadarLink(latitude, longitude),
  };
}

export async function fetchStationsByStateCodes(stateCodes: string[]) {
  const normalizedStates = unique(
    stateCodes
      .map((stateCode) => stateCode.trim().toUpperCase())
      .filter((stateCode) => /^[A-Z]{2}$/.test(stateCode)),
  );

  if (normalizedStates.length === 0) return [] as AwdbStation[];

  const byState = await Promise.all(
    normalizedStates.map(async (stateCode) => {
      const cached = stationStateCache.get(stateCode);
      const now = Date.now();
      if (cached && cached.expiresAt > now) return cached.data;

      const stations = await fetchAwdbJson<AwdbStation[]>("/stations", {
        stationTriplets: `*:${stateCode}:SNTL,*:${stateCode}:MSNT`,
        activeOnly: true,
      });

      const filtered = stations.filter((station) => {
        const hasCoords =
          station.latitude != null &&
          Number.isFinite(station.latitude) &&
          station.longitude != null &&
          Number.isFinite(station.longitude);
        return (
          hasCoords &&
          Boolean(station.stationId) &&
          Boolean(station.stationTriplet)
        );
      });

      stationStateCache.set(stateCode, {
        expiresAt: now + STATION_CACHE_TTL_MS,
        data: filtered,
      });

      return filtered;
    }),
  );

  const uniqueStations = new Map<string, AwdbStation>();
  byState.flat().forEach((station) => {
    uniqueStations.set(station.stationTriplet, station);
  });
  return Array.from(uniqueStations.values());
}

export async function fetchStationByTriplet(stationTriplet: string) {
  const normalizedTriplet = normalizeTripletInput(stationTriplet);
  if (!normalizedTriplet) return null;

  const stations = await fetchAwdbJson<AwdbStation[]>("/stations", {
    stationTriplets: normalizedTriplet,
    activeOnly: true,
  });
  return stations[0] ?? null;
}
