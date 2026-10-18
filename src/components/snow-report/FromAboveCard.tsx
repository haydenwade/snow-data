"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Satellite } from "lucide-react";
import { MountainLocation } from "@/types/location";
import { ClearSceneDay, ClearScenesResponse } from "@/types/imagery";
import { isClearSceneDay } from "@/components/stations/useClearScenes";
import { formatAvalancheArchiveDateLabel } from "@/components/stations/avalanche-archive-date";

const SNAPSHOT_URL = "https://wvs.earthdata.nasa.gov/api/v1/snapshot";
const HLS_LAYER = {
  S30: "HLS_S30_Nadir_BRDF_Adjusted_Reflectance",
  L30: "HLS_L30_Nadir_BRDF_Adjusted_Reflectance",
};
const IMAGE_WIDTH = 640;
const IMAGE_HEIGHT = 400;
const HALF_LAT_SPAN = 0.06; // ~13 km tall view

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; clearDays: ClearSceneDay[] }; // newest first

function viewBox(latitude: number, longitude: number) {
  // Keep ground distances square in a plain lat/lon snapshot.
  const halfLon = (HALF_LAT_SPAN * (IMAGE_WIDTH / IMAGE_HEIGHT)) / Math.cos((latitude * Math.PI) / 180);
  return {
    south: latitude - HALF_LAT_SPAN,
    north: latitude + HALF_LAT_SPAN,
    west: longitude - halfLon,
    east: longitude + halfLon,
  };
}

function daysAgoLabel(date: string) {
  const days = Math.round((Date.now() - Date.parse(`${date}T12:00:00Z`)) / 86_400_000);
  if (days <= 0) return "today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export default function FromAboveCard({ location }: { location: MountainLocation }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [imageFailed, setImageFailed] = useState(false);
  // Cloud cover is rated per 110 km scene, so a "clear" day can still be cloudy
  // over the station; let people step back to older clear days.
  const [dayIndex, setDayIndex] = useState(0);
  const { latitude, longitude } = location;
  const box = viewBox(latitude, longitude);

  useEffect(() => {
    const abortController = new AbortController();
    const bbox = [box.west, box.south, box.east, box.north].map((v) => v.toFixed(4)).join(",");
    fetch(`/api/imagery/clear-scenes?bbox=${bbox}`, { signal: abortController.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Imagery search failed (${response.status})`);
        return (await response.json()) as ClearScenesResponse;
      })
      .then((payload) =>
        setState({ status: "ready", clearDays: (payload.days ?? []).filter(isClearSceneDay) }),
      )
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        setState({ status: "error" });
      });
    return () => abortController.abort();
    // box is derived from latitude/longitude
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  const clearDays = state.status === "ready" ? state.clearDays : [];
  const day = clearDays[dayIndex] ?? null;
  const showDay = (index: number) => {
    setImageFailed(false);
    setDayIndex(index);
  };
  const mapHref = day
    ? `/map?date=${day.date}&lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}&z=12&sat=hls`
    : `/map?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}&z=10&sat=snow-cover`;
  const snapshotSrc = day
    ? `${SNAPSHOT_URL}?REQUEST=GetSnapshot&LAYERS=${HLS_LAYER[day.product]}&TIME=${day.date}` +
      `&BBOX=${box.south.toFixed(4)},${box.west.toFixed(4)},${box.north.toFixed(4)},${box.east.toFixed(4)}` +
      `&CRS=EPSG:4326&FORMAT=image/jpeg&WIDTH=${IMAGE_WIDTH}&HEIGHT=${IMAGE_HEIGHT}`
    : null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Satellite className="h-5 w-5 text-amber-300" />
          <h2 className="font-semibold text-white">From Above</h2>
        </div>
        <Link href={mapHref} className="text-xs text-sky-300 hover:text-sky-200">
          Open on map →
        </Link>
      </div>

      {state.status === "loading" ? (
        <div className="aspect-[8/5] w-full animate-pulse rounded-lg bg-slate-700/30" />
      ) : null}

      {state.status === "error" || (snapshotSrc && imageFailed) ? (
        <p className="text-sm text-red-400">
          Couldn&apos;t load satellite imagery right now. Try the map view instead.
        </p>
      ) : null}

      {state.status === "ready" && !day ? (
        <p className="text-sm text-slate-300">
          No clear 30 m satellite view of this area in the last 30 days, usually because of cloud.
          The map&apos;s daily snow cover layer may still show coverage.
        </p>
      ) : null}

      {day && snapshotSrc && !imageFailed ? (
        <>
          <div className="relative overflow-hidden rounded-lg border border-slate-700/60 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={snapshotSrc}
              alt={`Satellite view around ${location.name} on ${day.date}`}
              className="aspect-[8/5] w-full object-cover"
              onError={() => setImageFailed(true)}
            />
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-orange-500 shadow"
              aria-hidden="true"
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-sm text-slate-200">
              {formatAvalancheArchiveDateLabel(day.date)} · {daysAgoLabel(day.date)}
            </p>
            {clearDays.length > 1 ? (
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  className="rounded border border-slate-600 px-2 py-0.5 text-slate-200 hover:bg-slate-700/50 disabled:opacity-40"
                  onClick={() => showDay(dayIndex + 1)}
                  disabled={dayIndex >= clearDays.length - 1}
                >
                  Older
                </button>
                <button
                  type="button"
                  className="rounded border border-slate-600 px-2 py-0.5 text-slate-200 hover:bg-slate-700/50 disabled:opacity-40"
                  onClick={() => showDay(dayIndex - 1)}
                  disabled={dayIndex === 0}
                >
                  Newer
                </button>
              </div>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Imagery · NASA HLS ({day.product === "S30" ? "Sentinel-2" : "Landsat 8/9"}) · 30 m ·{" "}
            {day.cloudPct == null ? "cloud unknown" : `${Math.round(day.cloudPct)}% scene cloud`}.
            Orange dot is the station.
          </p>
        </>
      ) : null}
    </div>
  );
}
