import {
  GeoBounds,
  StationAvalancheRegion,
  StationNearbyAvalancheRegion,
} from "@/types/station";

export const AVALANCHE_MAP_LAYER_URL =
  "https://api.avalanche.org/v2/public/products/map-layer";

type AvalancheMapLayerGeometry =
  | {
      type: "Polygon";
      coordinates: [number, number][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: [number, number][][][];
    };

type AvalancheMapLayerFeatureProperties = {
  name?: string | null;
  center?: string | null;
  center_link?: string | null;
  timezone?: string | null;
  center_id?: string | null;
  state?: string | null;
  travel_advice?: string | null;
  danger?: string | null;
  danger_level?: number | null;
  color?: string | null;
  stroke?: string | null;
  font_color?: string | null;
  link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  fillOpacity?: number | null;
  warning?: {
    product?: string | null;
  } | null;
};

type AvalancheMapLayerApiFeature = {
  id?: string | number | null;
  geometry?: AvalancheMapLayerGeometry | null;
  properties?: AvalancheMapLayerFeatureProperties | null;
};

type AvalancheMapLayerApiResponse = {
  type?: string;
  features?: AvalancheMapLayerApiFeature[];
};

type NormalizedAvalancheFeature = {
  id: string;
  geometry: AvalancheMapLayerGeometry;
  properties: AvalancheMapLayerFeatureProperties;
  bounds: GeoBounds;
};

type AvalancheMapLayerCacheEntry = {
  fetchedAt: number;
  expiresAt: number;
  ttlSeconds: number;
  rawJson: AvalancheMapLayerApiResponse;
  features: NormalizedAvalancheFeature[];
};

let avalancheMapLayerCache: AvalancheMapLayerCacheEntry | null = null;
let avalancheMapLayerInflight: Promise<AvalancheMapLayerCacheEntry> | null = null;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function avalancheGeometryPolygons(geometry: AvalancheMapLayerGeometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

function computeFeatureBounds(geometry: AvalancheMapLayerGeometry): GeoBounds {
  let west = Number.POSITIVE_INFINITY;
  let south = Number.POSITIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;

  avalancheGeometryPolygons(geometry).forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach(([lon, lat]) => {
        if (lon < west) west = lon;
        if (lon > east) east = lon;
        if (lat < south) south = lat;
        if (lat > north) north = lat;
      });
    });
  });

  return { west, south, east, north };
}

function normalizeFeature(
  raw: AvalancheMapLayerApiFeature,
): NormalizedAvalancheFeature | null {
  const geometry = raw.geometry;
  if (!geometry || (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")) {
    return null;
  }
  if (!Array.isArray(geometry.coordinates)) return null;

  const properties = raw.properties ?? {};
  const fallbackId = [
    typeof properties.center_id === "string" ? properties.center_id : "ac",
    typeof properties.state === "string" ? properties.state : "xx",
    typeof properties.name === "string" ? properties.name : "zone",
  ]
    .join(":")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return {
    id: String(raw.id ?? fallbackId),
    geometry,
    properties,
    bounds: computeFeatureBounds(geometry),
  };
}

function normalizeMapLayerResponse(raw: AvalancheMapLayerApiResponse) {
  const features = Array.isArray(raw.features) ? raw.features : [];
  return features
    .map((feature) => normalizeFeature(feature))
    .filter((feature): feature is NormalizedAvalancheFeature => feature != null);
}

function getMountainHour(date: Date) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    hour: "numeric",
    hourCycle: "h23",
  }).format(date);
  const parsed = Number(hour);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getAvalancheMapLayerTtlSeconds(date = new Date()) {
  const hourMt = getMountainHour(date);
  if (hourMt >= 6 && hourMt < 10) return 5 * 60;
  if (hourMt >= 10) return 60 * 60;
  return 3 * 60 * 60;
}

async function fetchAvalancheMapLayerFromSource(): Promise<AvalancheMapLayerCacheEntry> {
  const response = await fetch(AVALANCHE_MAP_LAYER_URL, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Avalanche.org map-layer request failed (${response.status}): ${body.slice(0, 300)}`,
    );
  }

  const json = (await response.json()) as AvalancheMapLayerApiResponse;
  const features = normalizeMapLayerResponse(json);
  const now = Date.now();
  const ttlSeconds = getAvalancheMapLayerTtlSeconds(new Date(now));

  return {
    fetchedAt: now,
    expiresAt: now + ttlSeconds * 1000,
    ttlSeconds,
    rawJson: json,
    features,
  };
}

export async function getCachedAvalancheMapLayer() {
  const now = Date.now();
  if (avalancheMapLayerCache && avalancheMapLayerCache.expiresAt > now) {
    return {
      ...avalancheMapLayerCache,
      cacheStatus: "hit" as const,
    };
  }

  if (avalancheMapLayerInflight) {
    const entry = await avalancheMapLayerInflight;
    return {
      ...entry,
      cacheStatus: "hit" as const,
    };
  }

  avalancheMapLayerInflight = fetchAvalancheMapLayerFromSource()
    .then((entry) => {
      avalancheMapLayerCache = entry;
      return entry;
    })
    .finally(() => {
      avalancheMapLayerInflight = null;
    });

  try {
    const entry = await avalancheMapLayerInflight;
    return {
      ...entry,
      cacheStatus: "miss" as const,
    };
  } catch (error) {
    if (avalancheMapLayerCache) {
      return {
        ...avalancheMapLayerCache,
        cacheStatus: "stale" as const,
        cacheError: (error as Error)?.message ?? "Avalanche map-layer fetch failed",
      };
    }
    throw error;
  }
}

function pointWithinBounds(lat: number, lon: number, bounds: GeoBounds) {
  return (
    lon >= bounds.west &&
    lon <= bounds.east &&
    lat >= bounds.south &&
    lat <= bounds.north
  );
}

function isPointOnSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) {
  const epsilon = 1e-9;
  const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  if (Math.abs(cross) > epsilon) return false;

  const dot = (px - ax) * (bx - ax) + (py - ay) * (by - ay);
  if (dot < -epsilon) return false;

  const squaredLength = (bx - ax) ** 2 + (by - ay) ** 2;
  if (dot - squaredLength > epsilon) return false;

  return true;
}

function isPointInRing(lon: number, lat: number, ring: [number, number][]) {
  if (ring.length < 3) return false;

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i] ?? [0, 0];
    const [xj, yj] = ring[j] ?? [0, 0];

    if (isPointOnSegment(lon, lat, xi, yi, xj, yj)) {
      return true;
    }

    const intersects =
      (yi > lat) !== (yj > lat) &&
      lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function polygonContainsPoint(
  lon: number,
  lat: number,
  polygon: [number, number][][],
) {
  const outerRing = polygon[0];
  if (!outerRing || !isPointInRing(lon, lat, outerRing)) return false;

  for (let index = 1; index < polygon.length; index += 1) {
    const holeRing = polygon[index];
    if (holeRing && isPointInRing(lon, lat, holeRing)) return false;
  }

  return true;
}

function geometryContainsPoint(
  lon: number,
  lat: number,
  geometry: AvalancheMapLayerGeometry,
) {
  return avalancheGeometryPolygons(geometry).some((polygon) =>
    polygonContainsPoint(lon, lat, polygon),
  );
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function pointToSegmentDistanceMiles(
  pointLon: number,
  pointLat: number,
  aLon: number,
  aLat: number,
  bLon: number,
  bLat: number,
) {
  const milesPerLatDegree = 69.0;
  const cosLat = Math.cos(degreesToRadians(pointLat));
  const milesPerLonDegree = Math.max(0.0001, 69.172 * cosLat);

  const px = 0;
  const py = 0;
  const ax = (aLon - pointLon) * milesPerLonDegree;
  const ay = (aLat - pointLat) * milesPerLatDegree;
  const bx = (bLon - pointLon) * milesPerLonDegree;
  const by = (bLat - pointLat) * milesPerLatDegree;

  const abx = bx - ax;
  const aby = by - ay;
  const abLengthSquared = abx * abx + aby * aby;
  if (abLengthSquared <= Number.EPSILON) {
    return Math.hypot(px - ax, py - ay);
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLengthSquared),
  );
  const closestX = ax + t * abx;
  const closestY = ay + t * aby;
  return Math.hypot(px - closestX, py - closestY);
}

function ringDistanceMilesToPoint(
  lon: number,
  lat: number,
  ring: [number, number][],
) {
  if (ring.length < 2) return Number.POSITIVE_INFINITY;

  let minDistanceMiles = Number.POSITIVE_INFINITY;
  for (let index = 0; index < ring.length; index += 1) {
    const start = ring[index];
    const end = ring[(index + 1) % ring.length];
    if (!start || !end) continue;

    const [aLon, aLat] = start;
    const [bLon, bLat] = end;
    const distanceMiles = pointToSegmentDistanceMiles(
      lon,
      lat,
      aLon,
      aLat,
      bLon,
      bLat,
    );

    if (distanceMiles < minDistanceMiles) {
      minDistanceMiles = distanceMiles;
    }
  }

  return minDistanceMiles;
}

function geometryDistanceMilesToPoint(
  lon: number,
  lat: number,
  geometry: AvalancheMapLayerGeometry,
) {
  let minDistanceMiles = Number.POSITIVE_INFINITY;

  avalancheGeometryPolygons(geometry).forEach((polygon) => {
    polygon.forEach((ring) => {
      const ringDistanceMiles = ringDistanceMilesToPoint(lon, lat, ring);
      if (ringDistanceMiles < minDistanceMiles) {
        minDistanceMiles = ringDistanceMiles;
      }
    });
  });

  return minDistanceMiles;
}

function toStationAvalancheRegion(
  feature: NormalizedAvalancheFeature,
): StationAvalancheRegion {
  const props = feature.properties;
  return {
    id: feature.id,
    name: props.name ?? null,
    center: props.center ?? null,
    centerId: props.center_id ?? null,
    state: props.state ?? null,
    danger: props.danger ?? null,
    dangerLevel:
      props.danger_level == null || !isFiniteNumber(props.danger_level)
        ? null
        : props.danger_level,
    color: props.color ?? null,
    stroke: props.stroke ?? null,
    fontColor: props.font_color ?? null,
    link: props.link ?? null,
    centerLink: props.center_link ?? null,
    timezone: props.timezone ?? null,
    startDate: props.start_date ?? null,
    endDate: props.end_date ?? null,
    warningProduct: props.warning?.product ?? null,
    warningInEffect: Boolean(props.warning?.product),
  };
}

export async function findAvalancheRegionForPoint(lat: number, lon: number) {
  if (!isFiniteNumber(lat) || !isFiniteNumber(lon)) return null;

  const { features } = await getCachedAvalancheMapLayer();
  const match = features.find((feature) => {
    if (!pointWithinBounds(lat, lon, feature.bounds)) return false;
    return geometryContainsPoint(lon, lat, feature.geometry);
  });

  return match ? toStationAvalancheRegion(match) : null;
}

export async function findNearbyAvalancheRegionsForPoint(
  lat: number,
  lon: number,
  options?: {
    maxDistanceMiles?: number;
    limit?: number;
  },
): Promise<StationNearbyAvalancheRegion[]> {
  if (!isFiniteNumber(lat) || !isFiniteNumber(lon)) return [];

  const maxDistanceMiles = options?.maxDistanceMiles ?? 50;
  const limit = options?.limit ?? 3;
  const { features } = await getCachedAvalancheMapLayer();

  const nearby = features
    .map((feature) => {
      if (pointWithinBounds(lat, lon, feature.bounds) && geometryContainsPoint(lon, lat, feature.geometry)) {
        return null;
      }

      const distanceMiles = geometryDistanceMilesToPoint(lon, lat, feature.geometry);
      if (!Number.isFinite(distanceMiles) || distanceMiles > maxDistanceMiles) {
        return null;
      }

      return {
        ...toStationAvalancheRegion(feature),
        distanceMiles: Number(distanceMiles.toFixed(1)),
      } satisfies StationNearbyAvalancheRegion;
    })
    .filter((region): region is StationNearbyAvalancheRegion => region != null)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, Math.max(0, limit));

  return nearby;
}
