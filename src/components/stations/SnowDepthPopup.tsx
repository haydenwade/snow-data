"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { SnowDepthPointResponse } from "@/types/imagery";
import { Unit } from "@/types/forecast";
import { inchesToCm } from "@/components/snow-report/utils";

type SnowDepthPopupProps = {
  lat: number;
  lon: number;
  x: number;
  y: number;
  unit: Unit;
  onClose: () => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SnowDepthPointResponse };

function formatDepth(inches: number | null, unit: Unit) {
  if (inches == null) return "—";
  return unit === "mm" ? `${Math.round(inchesToCm(inches))} cm` : `${Math.round(inches)}"`;
}

function formatValidDate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Render with `key` set to the point so a new tap starts in the loading state. */
export default function SnowDepthPopup({ lat, lon, x, y, unit, onClose }: SnowDepthPopupProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const abortController = new AbortController();
    fetch(`/api/snow-depth?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`, {
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Snow depth unavailable (${response.status})`);
        return (await response.json()) as SnowDepthPointResponse;
      })
      .then((data) => setState({ status: "ready", data }))
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        setState({ status: "error", message: "Couldn't load modeled snow depth. Try again." });
      });
    return () => abortController.abort();
  }, [lat, lon]);

  const validDate = state.status === "ready" ? formatValidDate(state.data.validTime) : null;

  return (
    <div
      data-map-interactive="true"
      className="absolute z-50 w-60 -translate-x-1/2 -translate-y-[112%] rounded-xl border border-slate-600 bg-slate-900/95 p-3 text-sm shadow-2xl"
      style={{ left: x, top: y }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        onClick={onClose}
        aria-label="Close snow depth popup"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Modeled snow depth
      </div>

      {state.status === "loading" ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin text-sky-300" />
          Loading…
        </div>
      ) : null}

      {state.status === "error" ? (
        <p className="mt-2 text-xs text-red-400">{state.message}</p>
      ) : null}

      {state.status === "ready" && !state.data.covered ? (
        <p className="mt-2 text-xs text-slate-300">
          No model data here. SNODAS covers the lower 48 US states only.
        </p>
      ) : null}

      {state.status === "ready" && state.data.covered ? (
        <>
          <div className="mt-1 text-2xl font-bold text-white">
            {formatDepth(state.data.depthIn, unit)}
          </div>
          <div className="text-xs text-slate-300">
            SWE {formatDepth(state.data.sweIn, unit)}
          </div>
        </>
      ) : null}

      <p className="mt-2 text-[10px] leading-snug text-slate-500">
        Model · NOAA SNODAS · 1 km{validDate ? ` · ${validDate}` : ""}. Averages each 1 km cell;
        not a measurement or avalanche information.
      </p>
    </div>
  );
}
