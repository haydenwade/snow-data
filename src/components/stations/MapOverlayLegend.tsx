"use client";

import { formatAvalancheArchiveDateLabel } from "@/components/stations/avalanche-archive-date";
import {
  SNOW_COVER_LEGEND,
  SNOW_DEPTH_LEGEND,
  SatelliteMode,
} from "@/components/stations/map-overlays";

type MapOverlayLegendProps = {
  satelliteMode: SatelliteMode;
  satelliteDate: string;
  showSnowDepth: boolean;
};

const SATELLITE_SOURCE: Record<Exclude<SatelliteMode, "off">, string> = {
  "snow-cover": "Imagery · NASA VIIRS (NOAA-20) · 375 m",
  "true-color": "Imagery · NASA VIIRS (NOAA-20) · 250 m",
  hls: "Imagery · NASA HLS (Sentinel-2 / Landsat) · 30 m",
};

export default function MapOverlayLegend({
  satelliteMode,
  satelliteDate,
  showSnowDepth,
}: MapOverlayLegendProps) {
  if (satelliteMode === "off" && !showSnowDepth) return null;

  return (
    <div
      data-map-interactive="true"
      className="absolute left-3 top-3 z-50 flex w-56 flex-col gap-2 rounded-lg border border-slate-600 bg-slate-900/90 p-2 text-[10px] text-slate-300 shadow-lg"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {satelliteMode !== "off" ? (
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-100">
              {satelliteMode === "snow-cover" ? SNOW_COVER_LEGEND.title : "Satellite"}
            </span>
            <span className="font-semibold text-sky-300">
              {formatAvalancheArchiveDateLabel(satelliteDate)}
            </span>
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
          <p className="mt-0.5 text-slate-500">{SATELLITE_SOURCE[satelliteMode]}</p>
        </div>
      ) : null}

      {showSnowDepth ? (
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-100">Snow depth (in)</span>
            <span className="font-semibold text-violet-300">Latest</span>
          </div>
          <div className="mt-1 grid grid-cols-8 overflow-hidden rounded-sm">
            {SNOW_DEPTH_LEGEND.map((item) => (
              <div key={item.label} className="h-2" style={{ backgroundColor: item.color }} />
            ))}
          </div>
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
    </div>
  );
}
