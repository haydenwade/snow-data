"use client";

import { ReactNode, useRef } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Satellite,
} from "lucide-react";
import { formatAvalancheArchiveDateLabel } from "@/components/stations/avalanche-archive-date";

type MapDateDockProps = {
  date: string;
  /** Date being dragged to on the strip; shown in the label until release. */
  previewDate: string | null;
  maxDate: string;
  canAdvance: boolean;
  showArchiveWarning: boolean;
  hint: string | null;
  showLatestClear: boolean;
  isLatestClearPending: boolean;
  onStep: (days: number) => void;
  onPickDate: (date: string | null) => void;
  onViewToday: () => void;
  onLatestClear: () => void;
  /** Optional day strip rendered between the hint and the date row. */
  children?: ReactNode;
};

const iconButton =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition";

/** One card for every dated-layer control so the map keeps a single bottom footprint. */
export default function MapDateDock({
  date,
  previewDate,
  maxDate,
  canAdvance,
  showArchiveWarning,
  hint,
  showLatestClear,
  isLatestClearPending,
  onStep,
  onPickDate,
  onViewToday,
  onLatestClear,
  children,
}: MapDateDockProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    const input = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input) return;
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch {
      // Fallback below for browsers that block showPicker()
    }
    input.focus();
    input.click();
  };

  return (
    <div
      data-map-interactive="true"
      className="pointer-events-auto w-full max-w-[24rem] overflow-hidden rounded-lg border border-slate-600 bg-slate-900/90 shadow-lg backdrop-blur"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {showArchiveWarning ? (
        <div className="flex items-center gap-2 bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">Not the current avalanche danger</span>
          <button
            type="button"
            className="shrink-0 underline underline-offset-2 hover:text-red-100"
            onClick={onViewToday}
          >
            View today
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5 p-1.5">
        {hint ? <p className="px-1 text-center text-[10px] leading-snug text-slate-300">{hint}</p> : null}
        {children}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={`${iconButton} border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800`}
            onClick={() => onStep(-1)}
            aria-label="Previous map day"
            title="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <label
            className="relative flex h-8 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-md border border-slate-600 bg-slate-900/90 px-2 text-slate-100"
            title="Select map date"
            onClick={openPicker}
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-300" />
            <span
              className={[
                "truncate text-sm font-bold tracking-wide",
                previewDate ? "text-sky-300" : "",
              ].join(" ")}
            >
              {formatAvalancheArchiveDateLabel(previewDate ?? date)}
            </span>
            <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="date"
              value={date}
              max={maxDate}
              onChange={(event) => onPickDate(event.target.value || null)}
              className="pointer-events-none absolute inset-0 opacity-0"
              aria-label="Select map date"
              data-map-interactive="true"
              onPointerDown={(event) => event.stopPropagation()}
            />
          </label>

          <button
            type="button"
            className={[
              iconButton,
              canAdvance
                ? "border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800"
                : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500",
            ].join(" ")}
            onClick={() => onStep(1)}
            disabled={!canAdvance}
            aria-label="Next map day"
            title={canAdvance ? "Next day" : "Already viewing today"}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {showLatestClear ? (
            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-amber-300/50 bg-slate-900/90 px-2 text-xs font-semibold text-amber-100 hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
              onClick={onLatestClear}
              disabled={isLatestClearPending}
              aria-label="Jump to latest clear 30 m scene"
              title="Jump to the newest clear 30 m scene for this view"
            >
              {isLatestClearPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Satellite className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Latest clear</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
