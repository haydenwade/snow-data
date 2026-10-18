"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Pause, Play } from "lucide-react";
import { RadarFramesState } from "@/components/stations/useRadar";

type RadarPlayerProps = {
  status: RadarFramesState["status"];
  frames: string[];
  index: number;
  isPlaying: boolean;
  isBuffering: boolean;
  onTogglePlay: () => void;
  onSeek: (index: number) => void;
};

function formatScanTime(iso: string) {
  const parts = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).formatToParts(new Date(iso));
  const zone = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  const time = parts
    .filter((part) => part.type !== "timeZoneName")
    .map((part) => part.value)
    .join("")
    .trim();
  return { time, zone };
}

function formatAge(iso: string, now: number) {
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min ago` : `${hours} hr ago`;
}

/** Compact radar loop control: play/pause, scan time, and a scrubbable frame strip. */
export default function RadarPlayer({
  status,
  frames,
  index,
  isPlaying,
  isBuffering,
  onTogglePlay,
  onSeek,
}: RadarPlayerProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const shell =
    "flex h-11 w-full items-center gap-2.5 rounded-full border border-slate-600 bg-slate-900/90 pl-1.5 pr-3 shadow-lg backdrop-blur";

  if (status !== "ready" || frames.length === 0) {
    return (
      <div className={shell} role="status">
        <span className="inline-flex h-8 w-8 items-center justify-center text-slate-400">
          {status === "error" ? null : <LoaderCircle className="h-4 w-4 animate-spin" />}
        </span>
        <span className="text-xs text-slate-300">
          {status === "error" ? "Radar unavailable. Retrying shortly." : "Loading radar…"}
        </span>
      </div>
    );
  }

  const frame = frames[index] ?? frames[frames.length - 1];
  const isLatest = index === frames.length - 1;
  const { time, zone } = formatScanTime(frame);

  return (
    <div className={shell}>
      <button
        type="button"
        onClick={onTogglePlay}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-white"
        aria-label={isPlaying ? "Pause radar loop" : "Play radar loop"}
      >
        {isPlaying && isBuffering ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
        )}
      </button>

      <div className="w-[6.25rem] shrink-0 leading-tight" aria-live="off">
        <div className="text-sm font-semibold tabular-nums text-slate-100">
          {time} <span className="text-[10px] font-medium text-slate-400">{zone}</span>
        </div>
        <div className={["text-[10px]", isLatest ? "text-teal-300" : "text-slate-400"].join(" ")}>
          {isLatest ? `Latest · ${formatAge(frame, now)}` : formatAge(frame, now)}
        </div>
      </div>

      <div className="relative h-6 min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-0 flex items-center gap-[3px]" aria-hidden="true">
          {frames.map((scan, frameIndex) => (
            <div
              key={scan}
              className={[
                "flex-1 rounded-full transition-all",
                frameIndex === index ? "h-4 bg-teal-300" : "h-1.5",
                frameIndex === index ? "" : frameIndex < index ? "bg-slate-400" : "bg-slate-600",
              ].join(" ")}
            />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          step={1}
          value={index}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Radar scan time"
          aria-valuetext={`${time} ${zone}, ${formatAge(frame, now)}`}
          data-map-interactive="true"
        />
      </div>
    </div>
  );
}
