"use client";

import { Minus, Plus } from "lucide-react";
import {
  PointerEvent,
  WheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const TILE_SIZE = 256;
const MIN_ZOOM = 2;
const MAX_ZOOM = 16;
const DEFAULT_CENTER = { lat: 39.5, lon: -111.9 };
const DEFAULT_ZOOM = 5;
const CLICK_MOVE_THRESHOLD = 6;
const WHEEL_ZOOM_COOLDOWN_MS = 140;

type Coordinates = {
  lat: number;
  lon: number;
};

type MarkerPoint = Coordinates & {
  x: number;
  y: number;
};

type MapSize = {
  width: number;
  height: number;
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

function getInitialCenter(
  selectedLocation: Coordinates | null,
  lastApprovedLocation: Coordinates | null,
) {
  return selectedLocation ?? lastApprovedLocation ?? DEFAULT_CENTER;
}

function getInitialZoom(
  selectedLocation: Coordinates | null,
  lastApprovedLocation: Coordinates | null,
) {
  return selectedLocation || lastApprovedLocation ? 9 : DEFAULT_ZOOM;
}

function formatTileUrl(z: number, x: number, y: number) {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

export default function LocationPickerMap({
  selectedLocation,
  lastApprovedLocation,
  onSelect,
}: {
  selectedLocation: Coordinates | null;
  lastApprovedLocation: Coordinates | null;
  onSelect: (location: Coordinates) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<MapSize>({ width: 0, height: 0 });
  const [center, setCenter] = useState<Coordinates>(() =>
    getInitialCenter(selectedLocation, lastApprovedLocation),
  );
  const [zoom, setZoom] = useState(() =>
    getInitialZoom(selectedLocation, lastApprovedLocation),
  );
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startWorldX: number;
    startWorldY: number;
    moved: boolean;
  } | null>(null);
  const lastWheelZoomAtRef = useRef(0);

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

    const projectLocation = (location: Coordinates | null): MarkerPoint | null => {
      if (!location) return null;
      const world = latLonToWorld(location.lat, location.lon, zoom);
      return {
        ...location,
        x: world.x - topLeftX,
        y: world.y - topLeftY,
      };
    };

    return {
      centerWorld,
      tiles,
      selectedPoint: projectLocation(selectedLocation),
      lastApprovedPoint: projectLocation(lastApprovedLocation),
    };
  }, [
    center.lat,
    center.lon,
    lastApprovedLocation,
    selectedLocation,
    size.height,
    size.width,
    zoom,
  ]);

  const toLocalPoint = (clientX: number, clientY: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const selectAtPoint = (clientX: number, clientY: number) => {
    const localPoint = toLocalPoint(clientX, clientY);
    if (!localPoint || !mapState) return;

    const topLeftX = mapState.centerWorld.x - size.width / 2;
    const topLeftY = mapState.centerWorld.y - size.height / 2;
    const location = worldToLatLon(topLeftX + localPoint.x, topLeftY + localPoint.y, zoom);
    onSelect({
      lat: Number(location.lat.toFixed(6)),
      lon: Number(location.lon.toFixed(6)),
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!mapState) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-map-interactive="true"]')) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startWorldX: mapState.centerWorld.x,
      startWorldY: mapState.centerWorld.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;
    if (Math.hypot(deltaX, deltaY) > CLICK_MOVE_THRESHOLD) {
      drag.moved = true;
    }

    const nextCenter = worldToLatLon(drag.startWorldX - deltaX, drag.startWorldY - deltaY, zoom);
    setCenter(nextCenter);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const shouldSelect = !drag.moved;
    dragRef.current = null;

    if (shouldSelect) {
      selectAtPoint(event.clientX, event.clientY);
    }
  };

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const now = performance.now();
    if (now - lastWheelZoomAtRef.current < WHEEL_ZOOM_COOLDOWN_MS) return;
    lastWheelZoomAtRef.current = now;

    const direction = event.deltaY < 0 ? 1 : -1;
    setZoom((current) => clamp(current + direction, MIN_ZOOM, MAX_ZOOM));
  };

  const centerOnLocation = (location: Coordinates | null) => {
    if (!location) return;
    setCenter({ lat: location.lat, lon: location.lon });
    setZoom((current) => Math.max(current, 9));
  };

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 overflow-hidden">
      <div className="relative h-72 w-full overflow-hidden" onWheelCapture={onWheel}>
        <div
          ref={mapRef}
          className="absolute inset-0 touch-none bg-slate-900"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          {mapState?.tiles.map((tile) => (
            <img
              key={`${zoom}-${tile.x}-${tile.y}`}
              src={formatTileUrl(zoom, tile.x, tile.y)}
              alt=""
              className="absolute select-none pointer-events-none"
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                left: tile.left,
                top: tile.top,
              }}
              draggable={false}
            />
          ))}

          {mapState?.lastApprovedPoint ? (
            <button
              type="button"
              data-map-interactive="true"
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: mapState.lastApprovedPoint.x,
                top: mapState.lastApprovedPoint.y,
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => centerOnLocation(lastApprovedLocation)}
              aria-label="Center on last approved location"
              title="Last approved browser location"
            >
              <div className="h-3.5 w-3.5 rounded-full bg-sky-400 border-2 border-white shadow-lg" />
              <div className="pointer-events-none absolute inset-0 rounded-full border border-sky-200/80 scale-[1.9] opacity-75" />
            </button>
          ) : null}

          {mapState?.selectedPoint ? (
            <button
              type="button"
              data-map-interactive="true"
              className="absolute -translate-x-1/2 -translate-y-[85%] z-30"
              style={{
                left: mapState.selectedPoint.x,
                top: mapState.selectedPoint.y,
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => centerOnLocation(selectedLocation)}
              aria-label="Selected location"
              title="Selected location"
            >
              <div className="relative">
                <div className="h-6 w-6 rounded-full bg-black/95 border-2 border-orange-400 shadow-lg" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300" />
              </div>
            </button>
          ) : null}
        </div>

        <div className="absolute right-3 top-3 z-40 flex flex-col gap-2">
          <button
            type="button"
            data-map-interactive="true"
            className="h-9 w-9 rounded-lg border border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800"
            onClick={() => setZoom((current) => clamp(current + 1, MIN_ZOOM, MAX_ZOOM))}
            aria-label="Zoom in"
          >
            <Plus className="mx-auto h-4 w-4" />
          </button>
          <button
            type="button"
            data-map-interactive="true"
            className="h-9 w-9 rounded-lg border border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800"
            onClick={() => setZoom((current) => clamp(current - 1, MIN_ZOOM, MAX_ZOOM))}
            aria-label="Zoom out"
          >
            <Minus className="mx-auto h-4 w-4" />
          </button>
        </div>

        <div className="absolute left-3 top-3 z-40 rounded-lg border border-slate-600 bg-slate-900/90 px-2 py-1 text-[11px] text-slate-300">
          Click map to set location
        </div>

        <div className="absolute left-3 bottom-3 z-40 rounded-lg border border-slate-600 bg-slate-900/85 px-2 py-1 text-[11px] text-slate-400">
          OpenStreetMap
        </div>
      </div>
    </div>
  );
}
