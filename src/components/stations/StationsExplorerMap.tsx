"use client";

import Link from "next/link";
import {
  AlertTriangle,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  Snowflake,
  X,
} from "lucide-react";
import {
  PointerEvent,
  WheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { GeoBounds, StationSummary } from "@/types/station";

const TILE_SIZE = 256;
const MIN_ZOOM = 4;
const DEFAULT_CENTER = { lat: 40.7608, lon: -111.891 };
const DEFAULT_ZOOM = 7;
const WHEEL_ZOOM_COOLDOWN_MS = 180;
const PINCH_ZOOM_SENSITIVITY = 1.6;

type StateBounds = {
  code: string;
  north: number;
  south: number;
  east: number;
  west: number;
};

const SNOTEL_REGION_BOUNDS: StateBounds[] = [
  { code: "AK", north: 71.5, south: 51.2, east: -129.9, west: -169.2 },
  { code: "AB", north: 60.1, south: 48.9, east: -109.9, west: -120.1 },
  { code: "AZ", north: 37.1, south: 31.3, east: -109.0, west: -114.9 },
  { code: "BC", north: 60.1, south: 48.2, east: -114.0, west: -139.1 },
  { code: "CA", north: 42.0, south: 32.5, east: -114.1, west: -124.5 },
  { code: "CO", north: 41.0, south: 37.0, east: -102.0, west: -109.1 },
  { code: "ID", north: 49.0, south: 42.0, east: -111.0, west: -117.3 },
  { code: "MB", north: 60.0, south: 48.9, east: -89.5, west: -102.1 },
  { code: "MT", north: 49.0, south: 44.2, east: -104.0, west: -116.1 },
  { code: "ND", north: 49.0, south: 45.9, east: -96.5, west: -104.1 },
  { code: "NE", north: 43.1, south: 39.9, east: -95.3, west: -104.1 },
  { code: "NM", north: 37.0, south: 31.3, east: -103.0, west: -109.1 },
  { code: "NT", north: 78.0, south: 59.9, east: -102.0, west: -136.0 },
  { code: "NU", north: 83.2, south: 60.0, east: -61.0, west: -102.0 },
  { code: "NV", north: 42.0, south: 35.0, east: -114.0, west: -120.1 },
  { code: "OR", north: 46.3, south: 42.0, east: -116.4, west: -124.7 },
  { code: "SK", north: 60.0, south: 49.0, east: -101.3, west: -110.0 },
  { code: "SD", north: 45.9, south: 42.5, east: -96.4, west: -104.1 },
  { code: "UT", north: 42.0, south: 37.0, east: -109.0, west: -114.1 },
  { code: "WA", north: 49.0, south: 45.5, east: -116.9, west: -124.9 },
  { code: "WY", north: 45.0, south: 41.0, east: -104.0, west: -111.1 },
  { code: "YK", north: 69.7, south: 59.9, east: -123.8, west: -141.1 },
];

type BasemapKey = "light" | "satellite" | "topo";

type BasemapLayer = {
  id: string;
  tileUrl: (z: number, x: number, y: number) => string;
  opacity?: number;
};

type BasemapConfig = {
  label: string;
  attribution: string;
  maxZoom: number;
  layers: BasemapLayer[];
};

const BASEMAPS: Record<BasemapKey, BasemapConfig> = {
  light: {
    label: "Standard",
    attribution: "Carto Positron",
    maxZoom: 20,
    layers: [
      {
        id: "standard",
        tileUrl: (z, x, y) => {
          const shard = ["a", "b", "c", "d"][(x + y) % 4] ?? "a";
          return `https://${shard}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`;
        },
      },
    ],
  },
  satellite: {
    label: "Satellite",
    attribution: "Esri World Imagery",
    maxZoom: 19,
    layers: [
      {
        id: "imagery",
        tileUrl: (z, x, y) =>
          `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
      },
    ],
  },
  topo: {
    label: "Topo",
    attribution: "OpenTopoMap",
    maxZoom: 17,
    layers: [
      {
        id: "topo",
        tileUrl: (z, x, y) => `https://tile.opentopomap.org/${z}/${x}/${y}.png`,
      },
    ],
  },
};
const BASEMAP_ORDER: BasemapKey[] = ["light", "satellite", "topo"];

type ProjectedStation = {
  station: StationSummary;
  x: number;
  y: number;
};

type MarkerCluster = {
  id: string;
  count: number;
  x: number;
  y: number;
  lat: number;
  lon: number;
  stations: StationSummary[];
};

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
  state?: string | null;
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

type AvalancheMapLayerFeature = {
  id: string;
  geometry: AvalancheMapLayerGeometry;
  properties: AvalancheMapLayerFeatureProperties;
  bounds: GeoBounds;
  labelLat: number;
  labelLon: number;
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

type ProjectedAvalancheRegion = {
  feature: AvalancheMapLayerFeature;
  pathData: string;
  anchorX: number;
  anchorY: number;
};

type ActivePointer = {
  clientX: number;
  clientY: number;
};

type PinchGesture = {
  pointerIds: [number, number];
  startDistance: number;
  startZoom: number;
  anchorLat: number;
  anchorLon: number;
};

export type StationsMapViewport = {
  stateCodes: string[];
  bounds: GeoBounds;
};

type AnchoredPopupLayout = {
  left: number;
  top: number;
  maxHeight: number;
  arrowSide: "top" | "bottom" | "left" | "right";
  arrowOffset: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampLatitude(lat: number) {
  return clamp(lat, -85.05112878, 85.05112878);
}

function wrapTileX(tileX: number, zoom: number) {
  const count = 2 ** zoom;
  return ((tileX % count) + count) % count;
}

function latLonToWorld(lat: number, lon: number, zoom: number) {
  const boundedLat = clampLatitude(lat);
  const scale = TILE_SIZE * 2 ** zoom;
  const x = ((lon + 180) / 360) * scale;
  const sinLat = Math.sin((boundedLat * Math.PI) / 180);
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldToLatLon(x: number, y: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const lon = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat: clampLatitude(lat), lon };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function avalancheGeometryPolygons(geometry: AvalancheMapLayerGeometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

function computeAvalancheFeatureBounds(geometry: AvalancheMapLayerGeometry): GeoBounds {
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

function computeAvalancheFeatureLabelPoint(
  geometry: AvalancheMapLayerGeometry,
  bounds: GeoBounds,
) {
  let lonSum = 0;
  let latSum = 0;
  let count = 0;

  avalancheGeometryPolygons(geometry).forEach((polygon) => {
    const outerRing = polygon[0];
    if (!outerRing) return;
    outerRing.forEach(([lon, lat]) => {
      lonSum += lon;
      latSum += lat;
      count += 1;
    });
  });

  if (count === 0) {
    return {
      labelLon: (bounds.west + bounds.east) / 2,
      labelLat: (bounds.south + bounds.north) / 2,
    };
  }

  return {
    labelLon: lonSum / count,
    labelLat: latSum / count,
  };
}

function normalizeAvalancheFeature(raw: AvalancheMapLayerApiFeature): AvalancheMapLayerFeature | null {
  const geometry = raw.geometry;
  if (!geometry || (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")) {
    return null;
  }

  if (!Array.isArray(geometry.coordinates)) return null;

  const bounds = computeAvalancheFeatureBounds(geometry);
  const { labelLat, labelLon } = computeAvalancheFeatureLabelPoint(geometry, bounds);
  const properties = raw.properties ?? {};
  const fallbackId = [
    typeof properties.state === "string" ? properties.state : "XX",
    typeof properties.name === "string" ? properties.name : "zone",
  ]
    .join(":")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return {
    id: String(raw.id ?? fallbackId),
    geometry,
    properties,
    bounds,
    labelLat,
    labelLon,
  };
}

function normalizeAvalancheMapLayerResponse(raw: AvalancheMapLayerApiResponse) {
  const features = Array.isArray(raw.features) ? raw.features : [];
  return features
    .map((feature) => normalizeAvalancheFeature(feature))
    .filter((feature): feature is AvalancheMapLayerFeature => feature != null);
}

function boundsIntersect(first: GeoBounds, second: GeoBounds) {
  if (first.east < second.west) return false;
  if (first.west > second.east) return false;
  if (first.north < second.south) return false;
  if (first.south > second.north) return false;
  return true;
}

function wrapWorldXNear(referenceWorldX: number, candidateWorldX: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  let wrapped = candidateWorldX;
  while (wrapped - referenceWorldX > scale / 2) wrapped -= scale;
  while (wrapped - referenceWorldX < -scale / 2) wrapped += scale;
  return wrapped;
}

function ringToSvgPath(
  ring: [number, number][],
  zoom: number,
  topLeftX: number,
  topLeftY: number,
  viewportCenterWorldX: number,
) {
  if (ring.length === 0) return "";

  let previousWrappedWorldX: number | null = null;
  const commands: string[] = [];

  ring.forEach(([lon, lat], index) => {
    const pointWorld = latLonToWorld(lat, lon, zoom);
    let wrappedWorldX = wrapWorldXNear(viewportCenterWorldX, pointWorld.x, zoom);
    if (previousWrappedWorldX != null) {
      wrappedWorldX = wrapWorldXNear(previousWrappedWorldX, wrappedWorldX, zoom);
    }
    previousWrappedWorldX = wrappedWorldX;

    const x = wrappedWorldX - topLeftX;
    const y = pointWorld.y - topLeftY;
    commands.push(`${index === 0 ? "M" : "L"}${x} ${y}`);
  });

  return `${commands.join(" ")} Z`;
}

function geometryToSvgPath(
  geometry: AvalancheMapLayerGeometry,
  zoom: number,
  topLeftX: number,
  topLeftY: number,
  viewportCenterWorldX: number,
) {
  return avalancheGeometryPolygons(geometry)
    .map((polygon) =>
      polygon
        .map((ring) =>
          ringToSvgPath(ring, zoom, topLeftX, topLeftY, viewportCenterWorldX),
        )
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean)
    .join(" ");
}

function formatDangerLabel(danger: string | null | undefined, dangerLevel: number | null | undefined) {
  const normalized = (danger ?? "").trim();
  if (normalized) {
    return normalized
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  if (dangerLevel === -1) return "No Rating";
  if (dangerLevel === 1) return "Low";
  if (dangerLevel === 2) return "Moderate";
  if (dangerLevel === 3) return "Considerable";
  if (dangerLevel === 4) return "High";
  if (dangerLevel === 5) return "Extreme";
  return "Unknown";
}

function formatDangerHeadline(
  danger: string | null | undefined,
  dangerLevel: number | null | undefined,
) {
  const label = formatDangerLabel(danger, dangerLevel).toUpperCase();
  if (dangerLevel == null || dangerLevel < 0) return label;
  return `${dangerLevel} - ${label}`;
}

function formatValidityDateTime(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatValidityRange(
  start: string | null | undefined,
  end: string | null | undefined,
  timezone: string | null | undefined,
) {
  const startLabel = formatValidityDateTime(start);
  const endLabel = formatValidityDateTime(end);
  if (!startLabel && !endLabel) return null;
  const tzSuffix = typeof timezone === "string" && timezone.trim()
    ? ` ${timezone.split("/").pop()?.replace(/_/g, " ") ?? timezone}`
    : "";
  return `Valid: ${startLabel ?? "Unknown"} - ${endLabel ?? "Unknown"}${tzSuffix}`;
}

function clampOpacity(value: number | null | undefined, fallback: number) {
  return isFiniteNumber(value) ? clamp(value, 0, 1) : fallback;
}

function getAnchoredPopupLayout({
  anchorX,
  anchorY,
  viewportWidth,
  viewportHeight,
  popupWidth,
  popupHeight,
}: {
  anchorX: number;
  anchorY: number;
  viewportWidth: number;
  viewportHeight: number;
  popupWidth: number;
  popupHeight: number;
}): AnchoredPopupLayout {
  const margin = 16;
  const anchorGap = 14;
  const arrowInset = 22;
  const width = Math.max(
    0,
    Math.min(popupWidth, Math.max(0, viewportWidth - margin * 2)),
  );
  const height = Math.max(
    0,
    Math.min(popupHeight, Math.max(0, viewportHeight - margin * 2)),
  );

  const clampLeft = (value: number) =>
    clamp(value, margin, Math.max(margin, viewportWidth - width - margin));
  const clampTop = (value: number) =>
    clamp(value, margin, Math.max(margin, viewportHeight - height - margin));

  const canFitAbove = anchorY - anchorGap - height >= margin;
  const canFitBelow = anchorY + anchorGap + height <= viewportHeight - margin;
  const canFitRight = anchorX + anchorGap + width <= viewportWidth - margin;
  const canFitLeft = anchorX - anchorGap - width >= margin;

  let left = clampLeft(anchorX - width / 2);
  let top = clampTop(anchorY - anchorGap - height);
  let arrowSide: AnchoredPopupLayout["arrowSide"] = "bottom";

  if (canFitAbove) {
    left = clampLeft(anchorX - width / 2);
    top = anchorY - anchorGap - height;
    arrowSide = "bottom";
  } else if (canFitBelow) {
    left = clampLeft(anchorX - width / 2);
    top = anchorY + anchorGap;
    arrowSide = "top";
  } else if (canFitRight) {
    left = anchorX + anchorGap;
    top = clampTop(anchorY - height / 2);
    arrowSide = "left";
  } else if (canFitLeft) {
    left = anchorX - anchorGap - width;
    top = clampTop(anchorY - height / 2);
    arrowSide = "right";
  } else {
    const availableAbove = anchorY - margin;
    const availableBelow = viewportHeight - margin - anchorY;
    if (availableAbove >= availableBelow) {
      left = clampLeft(anchorX - width / 2);
      top = clampTop(anchorY - anchorGap - height);
      arrowSide = "bottom";
    } else {
      left = clampLeft(anchorX - width / 2);
      top = clampTop(anchorY + anchorGap);
      arrowSide = "top";
    }
  }

  const arrowOffset =
    arrowSide === "top" || arrowSide === "bottom"
      ? clamp(anchorX - left, arrowInset, Math.max(arrowInset, width - arrowInset))
      : clamp(anchorY - top, arrowInset, Math.max(arrowInset, height - arrowInset));

  return {
    left,
    top,
    maxHeight: Math.max(0, viewportHeight - margin * 2),
    arrowSide,
    arrowOffset,
  };
}

function intersects(bounds: GeoBounds, region: StateBounds) {
  if (region.east < bounds.west) return false;
  if (region.west > bounds.east) return false;
  if (region.north < bounds.south) return false;
  if (region.south > bounds.north) return false;
  return true;
}

function getVisibleStates(bounds: GeoBounds) {
  return SNOTEL_REGION_BOUNDS.filter((region) => intersects(bounds, region))
    .map((region) => region.code)
    .sort();
}

function roundBounds(bounds: GeoBounds): GeoBounds {
  return {
    west: Number(bounds.west.toFixed(2)),
    south: Number(bounds.south.toFixed(2)),
    east: Number(bounds.east.toFixed(2)),
    north: Number(bounds.north.toFixed(2)),
  };
}

function pointerDistance(first: ActivePointer, second: ActivePointer) {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function pointerMidpoint(first: ActivePointer, second: ActivePointer) {
  return {
    clientX: (first.clientX + second.clientX) / 2,
    clientY: (first.clientY + second.clientY) / 2,
  };
}

function clusterProjectedStations(
  projected: ProjectedStation[],
  zoom: number,
) {
  const cellSize = zoom <= 5 ? 72 : zoom <= 7 ? 56 : zoom <= 9 ? 40 : 28;
  const buckets = new Map<
    string,
    {
      xSum: number;
      ySum: number;
      latSum: number;
      lonSum: number;
      stations: StationSummary[];
    }
  >();

  projected.forEach((entry) => {
    const key = `${Math.floor(entry.x / cellSize)}:${Math.floor(entry.y / cellSize)}`;
    const bucket = buckets.get(key);
    if (!bucket) {
      buckets.set(key, {
        xSum: entry.x,
        ySum: entry.y,
        latSum: entry.station.latitude,
        lonSum: entry.station.longitude,
        stations: [entry.station],
      });
      return;
    }
    bucket.xSum += entry.x;
    bucket.ySum += entry.y;
    bucket.latSum += entry.station.latitude;
    bucket.lonSum += entry.station.longitude;
    bucket.stations.push(entry.station);
  });

  return Array.from(buckets.entries()).map(([id, bucket]) => {
    const count = bucket.stations.length;
    return {
      id,
      count,
      x: bucket.xSum / count,
      y: bucket.ySum / count,
      lat: bucket.latSum / count,
      lon: bucket.lonSum / count,
      stations: bucket.stations,
    } satisfies MarkerCluster;
  });
}

export default function StationsExplorerMap({
  stations,
  isRefreshing,
  onViewportChange,
}: {
  stations: StationSummary[];
  isRefreshing: boolean;
  onViewportChange: (viewport: StationsMapViewport) => void;
}) {
  const { lastApprovedLocation, setLastApprovedLocation } = useUserSettings();
  const cachedCurrentLocation = lastApprovedLocation
    ? {
        lat: lastApprovedLocation.lat,
        lon: lastApprovedLocation.lon,
      }
    : null;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const avalanchePopupRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [avalanchePopupSize, setAvalanchePopupSize] = useState({
    width: 0,
    height: 0,
  });
  const [center, setCenter] = useState(
    cachedCurrentLocation ?? DEFAULT_CENTER,
  );
  const [zoom, setZoom] = useState(cachedCurrentLocation ? 10 : DEFAULT_ZOOM);
  const [basemap, setBasemap] = useState<BasemapKey>("light");
  const [selectedStationTriplet, setSelectedStationTriplet] = useState<string | null>(null);
  const [selectedAvalancheRegionId, setSelectedAvalancheRegionId] = useState<string | null>(
    null,
  );
  const [avalancheFeatures, setAvalancheFeatures] = useState<AvalancheMapLayerFeature[]>([]);
  const [liveCurrentLocation, setLiveCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLocatingCurrentLocation, setIsLocatingCurrentLocation] = useState(false);
  const dragRef = useRef<{
    startClientX: number;
    startClientY: number;
    startWorldX: number;
    startWorldY: number;
  } | null>(null);
  const activePointersRef = useRef<Map<number, ActivePointer>>(new Map());
  const pinchRef = useRef<PinchGesture | null>(null);
  const lastViewportKeyRef = useRef("");
  const lastWheelZoomAtRef = useRef(0);
  const currentLocation = liveCurrentLocation ?? cachedCurrentLocation;

  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        width: Math.max(0, Math.floor(entry.contentRect.width)),
        height: Math.max(0, Math.floor(entry.contentRect.height)),
      });
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    fetch("/api/avalanche/map-layer", {
      cache: "no-store",
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Avalanche map-layer fetch failed: ${response.status}`);
        }
        const json = (await response.json()) as AvalancheMapLayerApiResponse;
        return normalizeAvalancheMapLayerResponse(json);
      })
      .then((features) => {
        setAvalancheFeatures(features);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
      });

    return () => {
      abortController.abort();
    };
  }, []);

  const maxZoom = BASEMAPS[basemap].maxZoom;

  const mapState = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;

    const centerWorld = latLonToWorld(center.lat, center.lon, zoom);
    const topLeftX = centerWorld.x - size.width / 2;
    const topLeftY = centerWorld.y - size.height / 2;

    const minTileX = Math.floor(topLeftX / TILE_SIZE);
    const maxTileX = Math.floor((topLeftX + size.width) / TILE_SIZE);
    const minTileY = Math.floor(topLeftY / TILE_SIZE);
    const maxTileY = Math.floor((topLeftY + size.height) / TILE_SIZE);
    const tileLimit = 2 ** zoom;

    const tiles: Array<{ x: number; y: number; left: number; top: number }> = [];
    for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
      if (tileY < 0 || tileY >= tileLimit) continue;
      for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
        tiles.push({
          x: wrapTileX(tileX, zoom),
          y: tileY,
          left: tileX * TILE_SIZE - topLeftX,
          top: tileY * TILE_SIZE - topLeftY,
        });
      }
    }

    const northWest = worldToLatLon(topLeftX, topLeftY, zoom);
    const southEast = worldToLatLon(
      topLeftX + size.width,
      topLeftY + size.height,
      zoom,
    );

    const bounds: GeoBounds = {
      north: northWest.lat,
      south: southEast.lat,
      west: northWest.lon,
      east: southEast.lon,
    };

    const projectedStations: ProjectedStation[] = stations
      .map((station) => {
        const world = latLonToWorld(station.latitude, station.longitude, zoom);
        return {
          station,
          x: world.x - topLeftX,
          y: world.y - topLeftY,
        };
      })
      .filter(
        (entry) =>
          entry.x >= -32 &&
          entry.x <= size.width + 32 &&
          entry.y >= -32 &&
          entry.y <= size.height + 32,
      );

    const clusters = clusterProjectedStations(projectedStations, zoom);

    const currentLocationPoint = currentLocation
      ? (() => {
          const world = latLonToWorld(currentLocation.lat, currentLocation.lon, zoom);
          return { x: world.x - topLeftX, y: world.y - topLeftY };
        })()
      : null;

    const avalancheRegions: ProjectedAvalancheRegion[] = avalancheFeatures
      .filter((feature) => boundsIntersect(bounds, feature.bounds))
      .map((feature) => {
        const pathData = geometryToSvgPath(
          feature.geometry,
          zoom,
          topLeftX,
          topLeftY,
          centerWorld.x,
        );
        const labelWorld = latLonToWorld(feature.labelLat, feature.labelLon, zoom);
        const wrappedLabelWorldX = wrapWorldXNear(centerWorld.x, labelWorld.x, zoom);
        return {
          feature,
          pathData,
          anchorX: wrappedLabelWorldX - topLeftX,
          anchorY: labelWorld.y - topLeftY,
        };
      })
      .filter((region) => region.pathData.length > 0);

    return {
      centerWorld,
      tiles,
      bounds,
      clusters,
      currentLocationPoint,
      avalancheRegions,
    };
  }, [
    avalancheFeatures,
    center.lat,
    center.lon,
    currentLocation,
    size.height,
    size.width,
    stations,
    zoom,
  ]);

  useEffect(() => {
    if (!mapState) return;
    const roundedBounds = roundBounds(mapState.bounds);
    const stateCodes = getVisibleStates(roundedBounds);
    const key = `${stateCodes.join(",")}|${roundedBounds.west},${roundedBounds.south},${roundedBounds.east},${roundedBounds.north}`;
    if (key === lastViewportKeyRef.current) return;
    lastViewportKeyRef.current = key;
    onViewportChange({ stateCodes, bounds: roundedBounds });
  }, [mapState, onViewportChange]);

  const selectedCluster = useMemo(
    () =>
      mapState?.clusters.find(
        (cluster) =>
          cluster.count === 1 &&
          cluster.stations[0]?.stationTriplet === selectedStationTriplet,
      ) ?? null,
    [mapState?.clusters, selectedStationTriplet],
  );

  const selectedStation = selectedCluster?.stations[0] ?? null;
  const selectedAvalancheRegion = useMemo(
    () =>
      mapState?.avalancheRegions.find(
        (region) => region.feature.id === selectedAvalancheRegionId,
      ) ?? null,
    [mapState?.avalancheRegions, selectedAvalancheRegionId],
  );

  const selectedAvalanchePopupTargetWidth = useMemo(() => {
    if (size.width <= 0) return 360;
    return clamp(Math.round(size.width * 0.22), 300, 440);
  }, [size.width]);

  useEffect(() => {
    if (!selectedAvalancheRegion || !avalanchePopupRef.current) return;
    const popupElement = avalanchePopupRef.current;

    const updateSize = () => {
      setAvalanchePopupSize({
        width: Math.ceil(popupElement.offsetWidth),
        height: Math.ceil(popupElement.offsetHeight),
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(popupElement);
    return () => observer.disconnect();
  }, [selectedAvalancheRegion]);

  const selectedAvalanchePopupLayout = useMemo(() => {
    if (!selectedAvalancheRegion) return null;
    if (size.width <= 0 || size.height <= 0) return null;

    const fallbackWidth = Math.min(selectedAvalanchePopupTargetWidth, Math.max(0, size.width - 24));
    const fallbackHeight = 260;

    return getAnchoredPopupLayout({
      anchorX: selectedAvalancheRegion.anchorX,
      anchorY: selectedAvalancheRegion.anchorY,
      viewportWidth: size.width,
      viewportHeight: size.height,
      popupWidth: avalanchePopupSize.width > 0 ? avalanchePopupSize.width : fallbackWidth,
      popupHeight: avalanchePopupSize.height > 0 ? avalanchePopupSize.height : fallbackHeight,
    });
  }, [
    selectedAvalancheRegion,
    size.width,
    size.height,
    avalanchePopupSize,
    selectedAvalanchePopupTargetWidth,
  ]);

  const toLocalPoint = (clientX: number, clientY: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startPinchGesture = (nextMapState = mapState) => {
    if (!nextMapState) return;
    if (size.width === 0 || size.height === 0) return;
    const pointerEntries = Array.from(activePointersRef.current.entries());
    if (pointerEntries.length < 2) return;

    const [firstEntry, secondEntry] = pointerEntries;
    if (!firstEntry || !secondEntry) return;
    const [firstPointerId, firstPointer] = firstEntry;
    const [secondPointerId, secondPointer] = secondEntry;

    const distance = pointerDistance(firstPointer, secondPointer);
    if (!Number.isFinite(distance) || distance <= 0) return;

    const midpoint = pointerMidpoint(firstPointer, secondPointer);
    const localPoint = toLocalPoint(midpoint.clientX, midpoint.clientY);
    if (!localPoint) return;

    const topLeftX = nextMapState.centerWorld.x - size.width / 2;
    const topLeftY = nextMapState.centerWorld.y - size.height / 2;
    const anchor = worldToLatLon(topLeftX + localPoint.x, topLeftY + localPoint.y, zoom);

    pinchRef.current = {
      pointerIds: [firstPointerId, secondPointerId],
      startDistance: distance,
      startZoom: zoom,
      anchorLat: anchor.lat,
      anchorLon: anchor.lon,
    };
    dragRef.current = null;
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!mapState) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-map-interactive="true"]')) return;
    setSelectedStationTriplet(null);
    setSelectedAvalancheRegionId(null);
    activePointersRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    if (activePointersRef.current.size >= 2) {
      startPinchGesture(mapState);
    } else {
      dragRef.current = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        startWorldX: mapState.centerWorld.x,
        startWorldY: mapState.centerWorld.y,
      };
      pinchRef.current = null;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointersRef.current.has(event.pointerId)) {
      activePointersRef.current.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    }

    const pinch = pinchRef.current;
    if (pinch) {
      const firstPointer = activePointersRef.current.get(pinch.pointerIds[0]);
      const secondPointer = activePointersRef.current.get(pinch.pointerIds[1]);
      if (!firstPointer || !secondPointer || size.width === 0 || size.height === 0) {
        return;
      }

      const distance = pointerDistance(firstPointer, secondPointer);
      if (!Number.isFinite(distance) || distance <= 0) return;

      const midpoint = pointerMidpoint(firstPointer, secondPointer);
      const localPoint = toLocalPoint(midpoint.clientX, midpoint.clientY);
      if (!localPoint) return;

      const zoomDelta = Math.round(
        Math.log2(distance / pinch.startDistance) * PINCH_ZOOM_SENSITIVITY,
      );
      const nextZoom = clamp(pinch.startZoom + zoomDelta, MIN_ZOOM, maxZoom);
      const anchorWorld = latLonToWorld(pinch.anchorLat, pinch.anchorLon, nextZoom);
      const nextCenterWorldX = anchorWorld.x - (localPoint.x - size.width / 2);
      const nextCenterWorldY = anchorWorld.y - (localPoint.y - size.height / 2);
      const nextCenter = worldToLatLon(nextCenterWorldX, nextCenterWorldY, nextZoom);

      setCenter(nextCenter);
      setZoom((current) => (current === nextZoom ? current : nextZoom));
      return;
    }

    if (!dragRef.current) return;
    const nextWorldX =
      dragRef.current.startWorldX -
      (event.clientX - dragRef.current.startClientX);
    const nextWorldY =
      dragRef.current.startWorldY -
      (event.clientY - dragRef.current.startClientY);
    const nextCenter = worldToLatLon(nextWorldX, nextWorldY, zoom);
    setCenter(nextCenter);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const pinch = pinchRef.current;
    if (pinch && pinch.pointerIds.includes(event.pointerId)) {
      pinchRef.current = null;
    }

    dragRef.current = null;

    if (!mapState) return;

    const remainingPointers = Array.from(activePointersRef.current.values());
    if (remainingPointers.length === 1) {
      const [pointer] = remainingPointers;
      if (!pointer) return;
      dragRef.current = {
        startClientX: pointer.clientX,
        startClientY: pointer.clientY,
        startWorldX: mapState.centerWorld.x,
        startWorldY: mapState.centerWorld.y,
      };
      return;
    }

    if (remainingPointers.length >= 2) {
      startPinchGesture(mapState);
    }
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const now = performance.now();
    if (now - lastWheelZoomAtRef.current < WHEEL_ZOOM_COOLDOWN_MS) return;
    const direction = event.deltaY < 0 ? 1 : -1;
    lastWheelZoomAtRef.current = now;

    setZoom((current) => {
      const next = current + direction;
      return clamp(next, MIN_ZOOM, maxZoom);
    });
  };

  const requestCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (isLocatingCurrentLocation) return;

    setIsLocatingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setLiveCurrentLocation(location);
        setCenter(location);
        setZoom((current) => Math.max(current, 10));
        setLastApprovedLocation({
          ...location,
          accuracyMeters:
            typeof position.coords.accuracy === "number"
              ? position.coords.accuracy
              : null,
        });
        setIsLocatingCurrentLocation(false);
      },
      () => {
        setIsLocatingCurrentLocation(false);
      },
      { maximumAge: 0, timeout: 10_000, enableHighAccuracy: false },
    );
  };

  const recenterOnCurrentLocation = () => {
    if (currentLocation) {
      setCenter(currentLocation);
      setZoom((current) => Math.max(current, 10));
      return;
    }

    requestCurrentLocation();
  };

  const canRequestBrowserLocation =
    typeof navigator !== "undefined" && Boolean(navigator.geolocation);
  const canUseLocateButton = Boolean(currentLocation) || canRequestBrowserLocation;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="relative z-40 min-h-[60px] px-4 py-3 border-b border-slate-700/70 bg-slate-900/95 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-200">
          <MapPin className="h-5 w-5 text-orange-400" />
          <h2 className="font-semibold">Weather Station Map</h2>
          {isRefreshing ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-300">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-sky-300" />
              refreshing
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-600/70 overflow-hidden">
            {BASEMAP_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                data-map-interactive="true"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  setBasemap(key);
                  setZoom((current) =>
                    clamp(current, MIN_ZOOM, BASEMAPS[key].maxZoom),
                  );
                }}
                className={[
                  "px-3 py-1.5 text-xs transition",
                  basemap === key
                    ? "bg-slate-200 text-slate-900"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-800/80",
                ].join(" ")}
              >
                {BASEMAPS[key].label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={recenterOnCurrentLocation}
            disabled={!canUseLocateButton || isLocatingCurrentLocation}
            className={[
              "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs border transition",
              canUseLocateButton && !isLocatingCurrentLocation
                ? "text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/10"
                : "text-slate-500 border-slate-700/70 cursor-not-allowed",
            ].join(" ")}
            title={
              currentLocation
                ? "Recenter on cached location"
                : "Request browser location"
            }
          >
            {isLocatingCurrentLocation ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="relative h-[600px] w-full overflow-hidden z-0" onWheelCapture={onWheel}>
        <div
          ref={mapRef}
          className="absolute inset-0 touch-none bg-slate-900"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {BASEMAPS[basemap].layers.map((layer) =>
            mapState?.tiles.map((tile) => (
              <img
                key={`${basemap}-${layer.id}-${zoom}-${tile.x}-${tile.y}`}
                src={layer.tileUrl(zoom, tile.x, tile.y)}
                alt=""
                className="absolute select-none pointer-events-none"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  left: tile.left,
                  top: tile.top,
                  opacity: layer.opacity ?? 1,
                }}
                draggable={false}
              />
            )),
          )}

          {mapState?.avalancheRegions.length ? (
            <svg
              className="absolute inset-0 z-20 pointer-events-none"
              viewBox={`0 0 ${size.width} ${size.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {mapState.avalancheRegions.map((region) => {
                const selected = region.feature.id === selectedAvalancheRegionId;
                const dangerLevel = region.feature.properties.danger_level ?? null;
                const isExtreme = dangerLevel === 5;
                const hasWarning = Boolean(region.feature.properties.warning?.product);
                const fillColor = region.feature.properties.color ?? "transparent";
                const strokeColor = region.feature.properties.stroke ?? "#000000";
                const baseFillOpacity = clampOpacity(
                  region.feature.properties.fillOpacity,
                  fillColor === "transparent" ? 0 : 0.5,
                );

                return (
                  <path
                    key={region.feature.id}
                    data-map-interactive="true"
                    d={region.pathData}
                    fillRule="evenodd"
                    className={[
                      "pointer-events-auto cursor-pointer motion-reduce:animate-none",
                      hasWarning ? "animate-pulse [animation-duration:3s]" : "",
                    ].join(" ")}
                    fill={fillColor}
                    fillOpacity={
                      selected ? Math.min(baseFillOpacity + 0.15, 0.9) : baseFillOpacity
                    }
                    stroke={strokeColor}
                    strokeOpacity={1}
                    strokeWidth={selected ? (isExtreme ? 4.5 : 3) : isExtreme ? 3.2 : 1.8}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => {
                      setSelectedStationTriplet(null);
                      setSelectedAvalancheRegionId(region.feature.id);
                    }}
                  />
                );
              })}
            </svg>
          ) : null}

          {mapState?.clusters.map((cluster) => {
            if (cluster.count > 1) {
              return (
                <button
                  key={cluster.id}
                  type="button"
                  data-map-interactive="true"
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ left: cluster.x, top: cluster.y }}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    setSelectedStationTriplet(null);
                    setSelectedAvalancheRegionId(null);
                    setCenter({ lat: cluster.lat, lon: cluster.lon });
                    setZoom((current) => clamp(current + 1, MIN_ZOOM, maxZoom));
                  }}
                  aria-label={`Zoom into cluster with ${cluster.count} stations`}
                >
                  <div className="min-w-8 h-8 px-2 rounded-full bg-black/90 border border-slate-200/70 text-slate-100 text-xs font-semibold shadow-lg">
                    <span className="leading-8">{cluster.count}</span>
                  </div>
                </button>
              );
            }

            const station = cluster.stations[0];
            if (!station) return null;
            const selected = station.stationTriplet === selectedStationTriplet;

            return (
              <button
                key={station.stationTriplet}
                type="button"
                data-map-interactive="true"
                className="absolute -translate-x-1/2 -translate-y-[85%] z-40"
                style={{ left: cluster.x, top: cluster.y }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  setSelectedAvalancheRegionId(null);
                  setSelectedStationTriplet(station.stationTriplet);
                }}
                aria-label={`Station ${station.stationId}`}
              >
                <div
                  className={[
                    "h-7 w-7 rounded-full border-2 transition shadow-lg flex items-center justify-center",
                    selected
                      ? "bg-black border-orange-400 ring-2 ring-orange-500/40 scale-110"
                      : "bg-black/95 border-slate-100/80 hover:border-slate-200",
                  ].join(" ")}
                >
                  <Snowflake className="h-3.5 w-3.5 text-white" />
                </div>
              </button>
            );
          })}

          {selectedCluster && selectedStation ? (
            <div
              data-map-interactive="true"
              className="absolute z-50 w-72 -translate-x-1/2 -translate-y-[118%] rounded-xl border border-slate-600 bg-slate-900/95 p-3 text-sm shadow-2xl"
              style={{ left: selectedCluster.x, top: selectedCluster.y }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="text-white font-semibold truncate">
                {selectedStation.name}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Station {selectedStation.stationId} · {selectedStation.stateCode}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {selectedStation.countyName}
                {selectedStation.elevationFt != null
                  ? ` · ${Math.round(selectedStation.elevationFt).toLocaleString()} ft`
                  : ""}
              </div>
              <div className="mt-3">
                <Link
                  href={`/stations/${encodeURIComponent(selectedStation.stationKey)}`}
                  className="inline-flex items-center rounded-lg border border-slate-500 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700/40"
                >
                  Open station
                </Link>
              </div>
            </div>
          ) : null}

          {selectedAvalancheRegion && selectedAvalanchePopupLayout ? (
            <div
              ref={avalanchePopupRef}
              data-map-interactive="true"
              className="absolute z-50 max-w-[calc(100%-1rem)]"
              style={{
                width: selectedAvalanchePopupTargetWidth,
                left: selectedAvalanchePopupLayout.left,
                top: selectedAvalanchePopupLayout.top,
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-3 w-3 rotate-45 border border-slate-300 bg-white shadow-sm"
                style={{
                  ...(selectedAvalanchePopupLayout.arrowSide === "top"
                    ? {
                        top: -6,
                        left: selectedAvalanchePopupLayout.arrowOffset - 6,
                      }
                    : {}),
                  ...(selectedAvalanchePopupLayout.arrowSide === "bottom"
                    ? {
                        bottom: -6,
                        left: selectedAvalanchePopupLayout.arrowOffset - 6,
                      }
                    : {}),
                  ...(selectedAvalanchePopupLayout.arrowSide === "left"
                    ? {
                        left: -6,
                        top: selectedAvalanchePopupLayout.arrowOffset - 6,
                      }
                    : {}),
                  ...(selectedAvalanchePopupLayout.arrowSide === "right"
                    ? {
                        right: -6,
                        top: selectedAvalanchePopupLayout.arrowOffset - 6,
                      }
                    : {}),
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-20 bg-white"
                style={{
                  ...(selectedAvalanchePopupLayout.arrowSide === "top"
                    ? {
                        top: 0,
                        left: selectedAvalanchePopupLayout.arrowOffset - 8,
                        width: 16,
                        height: 2,
                      }
                    : {}),
                  ...(selectedAvalanchePopupLayout.arrowSide === "bottom"
                    ? {
                        bottom: 0,
                        left: selectedAvalanchePopupLayout.arrowOffset - 8,
                        width: 16,
                        height: 2,
                      }
                    : {}),
                  ...(selectedAvalanchePopupLayout.arrowSide === "left"
                    ? {
                        left: 0,
                        top: selectedAvalanchePopupLayout.arrowOffset - 8,
                        width: 2,
                        height: 16,
                      }
                    : {}),
                  ...(selectedAvalanchePopupLayout.arrowSide === "right"
                    ? {
                        right: 0,
                        top: selectedAvalanchePopupLayout.arrowOffset - 8,
                        width: 2,
                        height: 16,
                      }
                    : {}),
                }}
              />

              <button
                type="button"
                className="absolute right-1.5 top-1.5 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-100"
                onClick={() => setSelectedAvalancheRegionId(null)}
                aria-label="Close avalanche forecast popup"
              >
                <X className="h-4 w-4" />
              </button>

              <div
                className="relative z-10 overflow-y-auto rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-2xl"
                style={{
                  maxHeight: selectedAvalanchePopupLayout.maxHeight,
                }}
              >
                <div className="relative rounded-md bg-slate-200 px-3 py-3 pr-20 sm:px-4 sm:pr-24">
                  <div className="text-[12px] font-bold tracking-wide text-slate-900 sm:text-[13px]">
                    {formatDangerHeadline(
                      selectedAvalancheRegion.feature.properties.danger ?? null,
                      selectedAvalancheRegion.feature.properties.danger_level ?? null,
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] font-bold tracking-wide text-slate-800 sm:text-[12px]">
                    AVALANCHE DANGER
                  </div>
                  <div className="absolute right-2.5 top-1/2 flex h-10 w-14 -translate-y-1/2 items-center justify-center overflow-hidden rounded-md border-2 border-slate-400 bg-white sm:right-3 sm:h-12 sm:w-16">
                    <img
                      src={`/danger-icons/${
                        selectedAvalancheRegion.feature.properties.danger_level != null &&
                        selectedAvalancheRegion.feature.properties.danger_level >= 1 &&
                        selectedAvalancheRegion.feature.properties.danger_level <= 5
                          ? selectedAvalancheRegion.feature.properties.danger_level
                          : 0
                      }.png`}
                      alt=""
                      aria-hidden="true"
                      className="max-h-full max-w-full object-contain p-1"
                      draggable={false}
                    />
                  </div>
                </div>

                {selectedAvalancheRegion.feature.properties.warning?.product ? (
                  <div className="mt-2 flex items-center gap-2 rounded-sm bg-red-600 px-2.5 py-2 text-[11px] font-extrabold tracking-wide text-white sm:text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>AVALANCHE WARNING IN EFFECT</span>
                  </div>
                ) : null}

                <div className="mt-3 space-y-1.5">
                  <div className="text-lg font-black leading-tight tracking-wide uppercase text-slate-900 sm:text-xl">
                    {selectedAvalancheRegion.feature.properties.name ?? "Avalanche Region"}
                  </div>
                  <div className="text-sm font-bold tracking-wide uppercase text-slate-600 sm:text-base">
                    {selectedAvalancheRegion.feature.properties.center ?? "Avalanche Center"}
                    {selectedAvalancheRegion.feature.properties.state
                      ? ` · ${selectedAvalancheRegion.feature.properties.state}`
                      : ""}
                  </div>
                  {formatValidityRange(
                    selectedAvalancheRegion.feature.properties.start_date ?? null,
                    selectedAvalancheRegion.feature.properties.end_date ?? null,
                    selectedAvalancheRegion.feature.properties.timezone ?? null,
                  ) ? (
                    <div className="text-xs italic text-slate-700 sm:text-sm">
                      {formatValidityRange(
                        selectedAvalancheRegion.feature.properties.start_date ?? null,
                        selectedAvalancheRegion.feature.properties.end_date ?? null,
                        selectedAvalancheRegion.feature.properties.timezone ?? null,
                      )}
                    </div>
                  ) : null}
                </div>

                {(selectedAvalancheRegion.feature.properties.link ||
                  selectedAvalancheRegion.feature.properties.center_link) ? (
                  <div className="mt-4">
                    <a
                      href={
                        selectedAvalancheRegion.feature.properties.link ??
                        selectedAvalancheRegion.feature.properties.center_link ??
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-md bg-slate-700 px-4 py-2.5 text-xs font-extrabold tracking-wide text-white hover:bg-slate-800 sm:text-sm"
                    >
                      {selectedAvalancheRegion.feature.properties.link
                        ? "GET THE FORECAST ↗"
                        : "OPEN AVALANCHE CENTER ↗"}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {mapState?.currentLocationPoint && currentLocation ? (
            <button
              type="button"
              data-map-interactive="true"
              className="absolute -translate-x-1/2 -translate-y-1/2 z-45"
              style={{
                left: mapState.currentLocationPoint.x,
                top: mapState.currentLocationPoint.y,
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={recenterOnCurrentLocation}
              aria-label="Current location"
              title="Current location"
            >
              <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-slate-100 shadow-lg" />
              <div className="pointer-events-none absolute inset-0 rounded-full border border-blue-300/70 scale-[1.8] opacity-70" />
            </button>
          ) : null}
        </div>

        <div className="absolute right-3 top-3 z-50 flex flex-col gap-2">
          <button
            type="button"
            data-map-interactive="true"
            className="h-9 w-9 rounded-lg border border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800"
            onClick={() =>
              setZoom((current) => clamp(current + 1, MIN_ZOOM, maxZoom))
            }
            aria-label="Zoom in"
          >
            <Plus className="mx-auto h-4 w-4" />
          </button>
          <button
            type="button"
            data-map-interactive="true"
            className="h-9 w-9 rounded-lg border border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800"
            onClick={() =>
              setZoom((current) => clamp(current - 1, MIN_ZOOM, maxZoom))
            }
            aria-label="Zoom out"
          >
            <Minus className="mx-auto h-4 w-4" />
          </button>
        </div>

        <div className="absolute left-3 bottom-3 z-50 rounded-lg border border-slate-600 bg-slate-900/85 px-2 py-1 text-[11px] text-slate-400">
          {BASEMAPS[basemap].attribution}
        </div>

        {!isRefreshing && stations.length === 0 ? (
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-1 text-xs text-slate-300">
            No stations found in the current viewport.
          </div>
        ) : null}
      </div>
    </div>
  );
}
