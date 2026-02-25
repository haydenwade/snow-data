"use client";

import Link from "next/link";
import {
  LoaderCircle,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  Snowflake,
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
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [center, setCenter] = useState(
    cachedCurrentLocation ?? DEFAULT_CENTER,
  );
  const [zoom, setZoom] = useState(cachedCurrentLocation ? 10 : DEFAULT_ZOOM);
  const [basemap, setBasemap] = useState<BasemapKey>("light");
  const [selectedStationTriplet, setSelectedStationTriplet] = useState<string | null>(null);
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

    return { centerWorld, tiles, bounds, clusters, currentLocationPoint };
  }, [center.lat, center.lon, currentLocation, size.height, size.width, stations, zoom]);

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
                onClick={() => setSelectedStationTriplet(station.stationTriplet)}
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
