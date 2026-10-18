"use client";

import { useEffect, useState } from "react";
import { RadarFramesResponse } from "@/types/radar";

const REFRESH_MS = 5 * 60_000;
const FRAME_MS = 500;
const LAST_FRAME_HOLD_MS = 1500;

export type RadarFramesState = {
  status: "idle" | "loading" | "ready" | "error";
  frames: string[];
};

/** Scan times for the loop, refreshed every 5 min while the layer is on. */
export function useRadarFrames(enabled: boolean): RadarFramesState {
  const [frames, setFrames] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let abortController: AbortController | null = null;
    const load = () => {
      abortController?.abort();
      abortController = new AbortController();
      fetch("/api/radar/frames", { signal: abortController.signal })
        .then(async (response) => {
          const json = await response.json().catch(() => null);
          if (!response.ok) throw new Error(json?.error || `Radar request failed (${response.status})`);
          return json as RadarFramesResponse;
        })
        .then((payload) => {
          const next = payload.frames ?? [];
          // Same scans: keep the old array so tiles and playback aren't disturbed.
          setFrames((current) => (current.join() === next.join() ? current : next));
          setHasError(false);
        })
        .catch((error: unknown) => {
          if ((error as Error)?.name === "AbortError") return;
          // A failed refresh keeps showing the last good loop.
          setHasError(true);
        });
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      clearInterval(timer);
      abortController?.abort();
    };
  }, [enabled]);

  if (!enabled) return { status: "idle", frames: [] };
  if (frames.length > 0) return { status: "ready", frames };
  return { status: hasError ? "error" : "loading", frames };
}

export type RadarPlayback = {
  index: number;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  seek: (index: number) => void;
};

/**
 * Loops frames oldest to newest, holding on the newest. Shows the newest
 * frame first and only advances while `canAdvance` (all frames loaded).
 */
export function useRadarPlayback(frameCount: number, canAdvance: boolean): RadarPlayback {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // null = newest
  const [isPlaying, setIsPlaying] = useState(true);
  const lastIndex = Math.max(0, frameCount - 1);
  const index = selectedIndex == null ? lastIndex : Math.min(selectedIndex, lastIndex);

  useEffect(() => {
    if (!isPlaying || !canAdvance || frameCount < 2) return;
    const atLast = index >= lastIndex;
    const timer = setTimeout(
      () => setSelectedIndex(atLast ? 0 : index + 1),
      atLast ? LAST_FRAME_HOLD_MS : FRAME_MS,
    );
    return () => clearTimeout(timer);
  }, [canAdvance, frameCount, index, isPlaying, lastIndex]);

  return {
    index,
    isPlaying,
    setIsPlaying,
    seek: (next) => {
      setIsPlaying(false);
      setSelectedIndex(next);
    },
  };
}
