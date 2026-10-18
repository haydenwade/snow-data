"use client";

import { useMemo, useState } from "react";
import {
  addDaysToIsoDate,
  formatAvalancheArchiveDateLabel,
} from "@/components/stations/avalanche-archive-date";
import { isClearSceneDay } from "@/components/stations/useClearScenes";
import { ClearSceneDay } from "@/types/imagery";

const SCRUBBER_DAYS = 30;

type SatelliteDateScrubberProps = {
  today: string;
  selectedDate: string;
  showSceneDays: boolean;
  sceneDays: ClearSceneDay[];
  /** Called once the user lets go; `null` means today. */
  onCommit: (date: string | null) => void;
};

/**
 * Last 30 days as a strip. Dragging only previews the date; the map loads
 * the new day on release so every intermediate day isn't fetched.
 */
export default function SatelliteDateScrubber({
  today,
  selectedDate,
  showSceneDays,
  sceneDays,
  onCommit,
}: SatelliteDateScrubberProps) {
  const dates = useMemo(
    () =>
      Array.from({ length: SCRUBBER_DAYS }, (_, index) =>
        addDaysToIsoDate(today, index - (SCRUBBER_DAYS - 1)) ?? today,
      ),
    [today],
  );
  const sceneByDate = useMemo(
    () => new Map(sceneDays.map((day) => [day.date, day])),
    [sceneDays],
  );
  const selectedIndex = dates.indexOf(selectedDate);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const shownIndex = previewIndex ?? (selectedIndex >= 0 ? selectedIndex : SCRUBBER_DAYS - 1);

  const commit = () => {
    if (previewIndex == null) return;
    const date = dates[previewIndex];
    setPreviewIndex(null);
    if (!date || previewIndex === selectedIndex) return;
    onCommit(date === today ? null : date);
  };

  const tickClass = (date: string, index: number) => {
    if (index === shownIndex) return "bg-sky-300";
    if (!showSceneDays) return "bg-slate-500/70";
    const scene = sceneByDate.get(date);
    if (!scene) return "bg-slate-700";
    return isClearSceneDay(scene) ? "bg-emerald-400" : "bg-slate-400";
  };

  return (
    <div className="flex w-[min(92vw,26rem)] flex-col gap-1 rounded-lg border border-slate-600 bg-slate-900/90 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>{formatAvalancheArchiveDateLabel(dates[0] ?? today)}</span>
        <span className="font-semibold text-slate-100">
          {previewIndex != null
            ? formatAvalancheArchiveDateLabel(dates[previewIndex] ?? today)
            : "Last 30 days"}
        </span>
        <span>TODAY</span>
      </div>
      <div className="relative h-6">
        <div className="pointer-events-none absolute inset-0 flex items-end gap-[2px]" aria-hidden="true">
          {dates.map((date, index) => (
            <div
              key={date}
              className={[
                "flex-1 rounded-sm transition-all",
                index === shownIndex ? "h-6" : "h-3",
                tickClass(date, index),
              ].join(" ")}
            />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={SCRUBBER_DAYS - 1}
          step={1}
          value={shownIndex}
          onChange={(event) => setPreviewIndex(Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Scrub satellite imagery date"
          aria-valuetext={formatAvalancheArchiveDateLabel(dates[shownIndex] ?? today)}
          data-map-interactive="true"
        />
      </div>
      {showSceneDays ? (
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-emerald-400" /> Clear 30 m scene
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-slate-400" /> Cloudy
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-slate-700" /> No pass
          </span>
        </div>
      ) : null}
    </div>
  );
}
