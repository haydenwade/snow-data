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
  /** Fires while dragging so the dock's date label can follow; `null` when released. */
  onPreview: (date: string | null) => void;
  /** Called once the user lets go; `null` means today. */
  onCommit: (date: string | null) => void;
};

/**
 * Last 30 days as a bare strip (the dock supplies the card and date label).
 * Dragging only previews the date; the map loads the new day on release so
 * every intermediate day isn't fetched.
 */
export default function SatelliteDateScrubber({
  today,
  selectedDate,
  showSceneDays,
  sceneDays,
  onPreview,
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
    onPreview(null);
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
        onChange={(event) => {
          const index = Number(event.target.value);
          setPreviewIndex(index);
          onPreview(dates[index] ?? null);
        }}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Scrub satellite imagery date, last 30 days"
        aria-valuetext={formatAvalancheArchiveDateLabel(dates[shownIndex] ?? today)}
        data-map-interactive="true"
      />
    </div>
  );
}
