"use client";

import { useState, useSyncExternalStore } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatAvalancheArchiveDateLabel } from "@/components/stations/avalanche-archive-date";
import {
  RADAR_LEGEND,
  SNOW_COVER_LEGEND,
  SNOW_DEPTH_LEGEND,
  SatelliteMode,
  hlsFillRange,
} from "@/components/stations/map-overlays";

type MapOverlayLegendProps = {
  satelliteMode: SatelliteMode;
  satelliteDate: string;
  showSnowDepth: boolean;
  showRadar: boolean;
  /** Key for the clear/cloudy/no-pass colors on the date strip. */
  showSceneKey: boolean;
};

const SATELLITE_SOURCE: Record<Exclude<SatelliteMode, "off">, string> = {
  "snow-cover": "Imagery · NASA VIIRS (NOAA-20) · 375 m",
  "true-color": "Imagery · NASA VIIRS (NOAA-20) · 250 m",
  hls: "Imagery · NASA HLS (Sentinel-2 / Landsat) · 30 m",
};

const EXPANDED_STORAGE_KEY = "snowd-map-legend-expanded";

const SNOW_DEPTH_GRADIENT = `linear-gradient(to right, ${SNOW_DEPTH_LEGEND.map((item, index) => {
  const step = 100 / SNOW_DEPTH_LEGEND.length;
  return `${item.color} ${index * step}% ${(index + 1) * step}%`;
}).join(", ")})`;

const DESKTOP_QUERY = "(min-width: 640px)";

function subscribeToDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readDefaultExpanded() {
  try {
    const saved = window.localStorage.getItem(EXPANDED_STORAGE_KEY);
    if (saved != null) return saved === "1";
  } catch {
    // Storage blocked; fall back to the screen-size default.
  }
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function SceneKey() {
  return (
    <div className="flex items-center gap-2 text-[9px] text-slate-400">
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-sm bg-emerald-400" /> Clear
      </span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-sm bg-slate-400" /> Cloudy
      </span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-sm bg-slate-700" /> No pass
      </span>
    </div>
  );
}

function CompactRow({ label, gradient, meta, metaClassName }: {
  label: string;
  gradient?: string;
  meta: string;
  metaClassName: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[4.5rem] shrink-0 font-semibold text-slate-100">{label}</span>
      {gradient ? (
        <span className="h-1.5 w-10 shrink-0 rounded-sm" style={{ background: gradient }} />
      ) : null}
      <span className={`whitespace-nowrap font-semibold ${metaClassName}`}>{meta}</span>
    </div>
  );
}

export default function MapOverlayLegend({
  satelliteMode,
  satelliteDate,
  showSnowDepth,
  showRadar,
  showSceneKey,
}: MapOverlayLegendProps) {
  // Server renders collapsed; the client uses the saved choice, else open on desktop only.
  const defaultExpanded = useSyncExternalStore(subscribeToDesktop, readDefaultExpanded, () => false);
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const isExpanded = userExpanded ?? defaultExpanded;

  if (satelliteMode === "off" && !showSnowDepth && !showRadar) return null;
  const hlsFill = satelliteMode === "hls" ? hlsFillRange(satelliteDate) : null;
  const satelliteDateLabel = formatAvalancheArchiveDateLabel(satelliteDate);

  const toggle = () => {
    const next = !isExpanded;
    setUserExpanded(next);
    try {
      window.localStorage.setItem(EXPANDED_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // Not persisted; fine.
    }
  };

  return (
    <div
      data-map-interactive="true"
      className="absolute left-3 top-3 z-50 rounded-lg border border-slate-600 bg-slate-900/90 text-[10px] text-slate-300 shadow-lg"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {!isExpanded ? (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={false}
          aria-label="Show map legend details"
          className="flex items-center gap-2 px-2 py-1.5 text-left"
        >
          <span className="flex flex-col gap-1">
            {satelliteMode !== "off" ? (
              <CompactRow
                label={satelliteMode === "snow-cover" ? "Snow cover" : "Satellite"}
                gradient={satelliteMode === "snow-cover" ? SNOW_COVER_LEGEND.gradient : undefined}
                meta={satelliteDateLabel}
                metaClassName="text-sky-300"
              />
            ) : null}
            {satelliteMode !== "off" && showSceneKey ? <SceneKey /> : null}
            {showSnowDepth ? (
              <CompactRow
                label="Snow depth"
                gradient={SNOW_DEPTH_GRADIENT}
                meta="Latest"
                metaClassName="text-violet-300"
              />
            ) : null}
            {showRadar ? (
              <CompactRow
                label="Radar"
                gradient={RADAR_LEGEND.gradient}
                meta="Last 2 hrs"
                metaClassName="text-teal-300"
              />
            ) : null}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        </button>
      ) : (
        <div className="flex w-56 flex-col gap-2 p-2">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={true}
            className="-mb-1 flex items-center justify-between text-[9px] font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-200"
          >
            Legend
            <ChevronUp className="h-3.5 w-3.5" />
          </button>

          {satelliteMode !== "off" ? (
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-100">
                  {satelliteMode === "snow-cover" ? SNOW_COVER_LEGEND.title : "Satellite"}
                </span>
                <span className="font-semibold text-sky-300">{satelliteDateLabel}</span>
              </div>
              {satelliteMode === "snow-cover" ? (
                <>
                  <div
                    className="mt-1 h-2 w-full rounded-sm"
                    style={{ background: SNOW_COVER_LEGEND.gradient }}
                    aria-hidden="true"
                  />
                  <div className="mt-0.5 flex justify-between text-slate-400">
                    <span>{SNOW_COVER_LEGEND.lowLabel}</span>
                    <span>{SNOW_COVER_LEGEND.highLabel}</span>
                  </div>
                  <p className="mt-0.5 text-slate-400">{SNOW_COVER_LEGEND.note}</p>
                </>
              ) : null}
              {showSceneKey ? (
                <div className="mt-1">
                  <SceneKey />
                </div>
              ) : null}
              {hlsFill ? (
                <p className="mt-0.5 text-amber-200/90">
                  Mixed dates. Where {satelliteDateLabel} has no pass, the newest from{" "}
                  {formatAvalancheArchiveDateLabel(hlsFill.from)} –{" "}
                  {formatAvalancheArchiveDateLabel(hlsFill.to)} shows instead.
                </p>
              ) : null}
              <p className="mt-0.5 text-slate-500">{SATELLITE_SOURCE[satelliteMode]}</p>
            </div>
          ) : null}

          {showSnowDepth ? (
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-100">Snow depth (in)</span>
                <span className="font-semibold text-violet-300">Latest</span>
              </div>
              <div
                className="mt-1 h-2 w-full rounded-sm"
                style={{ background: SNOW_DEPTH_GRADIENT }}
                aria-hidden="true"
              />
              {/* Labels sit on bin edges: 10" after bin 3, 39" after bin 5, 98" after bin 7 of 8. */}
              <div className="relative mt-0.5 h-3 text-[9px] text-slate-400">
                <span className="absolute left-0">0</span>
                <span className="absolute left-[37.5%] -translate-x-1/2">10</span>
                <span className="absolute left-[62.5%] -translate-x-1/2">39</span>
                <span className="absolute left-[87.5%] -translate-x-1/2">98+</span>
              </div>
              <p className="mt-0.5 text-slate-400">Tap the map for a point value.</p>
              <p className="mt-0.5 text-slate-500">Model · NOAA SNODAS · 1 km · US only</p>
            </div>
          ) : null}

          {showRadar ? (
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-100">Radar</span>
                <span className="font-semibold text-teal-300">Last 2 hrs</span>
              </div>
              <div
                className="mt-1 h-2 w-full rounded-sm"
                style={{ background: RADAR_LEGEND.gradient }}
                aria-hidden="true"
              />
              <div className="mt-0.5 flex justify-between text-slate-400">
                <span>{RADAR_LEGEND.lowLabel}</span>
                <span>{RADAR_LEGEND.highLabel}</span>
              </div>
              <p className="mt-0.5 text-slate-400">{RADAR_LEGEND.note}</p>
              <p className="mt-0.5 text-slate-500">Radar · NOAA MRMS · US only</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
