"use client";

import { useEffect, useState } from "react";
import { GeoBounds } from "@/types/station";
import { ClearSceneDay, ClearScenesResponse } from "@/types/imagery";

/** HLS scene-level cloud cover at or below this counts as "clear". */
export const CLEAR_SCENE_MAX_CLOUD_PCT = 20;
/** Below this zoom the view spans too many HLS tiles to search. */
export const CLEAR_SCENE_MIN_ZOOM = 9;
const DEBOUNCE_MS = 500;

export type ClearScenesState = {
  status: "idle" | "loading" | "ready" | "error";
  days: ClearSceneDay[];
  error: string | null;
};

const IDLE: ClearScenesState = { status: "idle", days: [], error: null };

function bboxKey(bounds: GeoBounds | null) {
  if (!bounds) return null;
  // ~1 km rounding so small pans reuse the same search.
  return [bounds.west, bounds.south, bounds.east, bounds.north]
    .map((value) => value.toFixed(2))
    .join(",");
}

export function isClearSceneDay(day: ClearSceneDay) {
  return day.cloudPct != null && day.cloudPct <= CLEAR_SCENE_MAX_CLOUD_PCT;
}

/** Newest clear day (`days` is newest first), or null when none are clear. */
export function pickLatestClearDay(days: ClearSceneDay[]) {
  return days.find(isClearSceneDay) ?? null;
}

export function useClearScenes(bounds: GeoBounds | null, enabled: boolean): ClearScenesState {
  const [state, setState] = useState<ClearScenesState & { key: string | null }>({
    ...IDLE,
    key: null,
  });
  const key = enabled ? bboxKey(bounds) : null;

  useEffect(() => {
    if (!key) return;
    const abortController = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/imagery/clear-scenes?bbox=${key}`, { signal: abortController.signal })
        .then(async (response) => {
          const json = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(json?.error || `Imagery search failed (${response.status})`);
          }
          return json as ClearScenesResponse;
        })
        .then((payload) =>
          setState({ status: "ready", days: payload.days ?? [], error: null, key }),
        )
        .catch((error: unknown) => {
          if ((error as Error)?.name === "AbortError") return;
          setState({
            status: "error",
            days: [],
            error: (error as Error)?.message ?? "Imagery search failed",
            key,
          });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [key]);

  if (!key) return IDLE;
  // While a new view is searched, keep the previous days so the scrubber doesn't flicker.
  if (state.key !== key) return { status: "loading", days: state.days, error: null };
  return { status: state.status, days: state.days, error: state.error };
}
