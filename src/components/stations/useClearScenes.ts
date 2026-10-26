"use client";

import { useEffect, useState } from "react";
import { GeoBounds } from "@/types/station";
import { ClearSceneDay, CloudCoverDay } from "@/types/imagery";

/** Cloud cover (HLS scene or Open-Meteo) at or below this counts as "clear". */
export const CLEAR_SCENE_MAX_CLOUD_PCT = 20;
/** Below this zoom the view spans too many HLS tiles to search. */
export const CLEAR_SCENE_MIN_ZOOM = 9;
const DEBOUNCE_MS = 500;

type DaysState<Day> = {
  status: "idle" | "loading" | "ready" | "error";
  days: Day[];
  error: string | null;
};

export type ClearScenesState = DaysState<ClearSceneDay>;

function bboxKey(bounds: GeoBounds | null) {
  if (!bounds) return null;
  // ~1 km rounding so small pans reuse the same search.
  return [bounds.west, bounds.south, bounds.east, bounds.north]
    .map((value) => value.toFixed(2))
    .join(",");
}

export function isClearSceneDay(day: { cloudPct: number | null }) {
  return day.cloudPct != null && day.cloudPct <= CLEAR_SCENE_MAX_CLOUD_PCT;
}

/** Newest clear day (`days` is newest first), or null when none are clear. */
export function pickLatestClearDay<Day extends { cloudPct: number | null }>(days: Day[]) {
  return days.find(isClearSceneDay) ?? null;
}

/** Debounced GET of `{ days }` for `url`; idle when `url` is null. */
function useDays<Day>(url: string | null, fallbackError: string): DaysState<Day> {
  const [state, setState] = useState<DaysState<Day> & { url: string | null }>({
    status: "idle",
    days: [],
    error: null,
    url: null,
  });

  useEffect(() => {
    if (!url) return;
    const abortController = new AbortController();
    const timer = setTimeout(() => {
      fetch(url, { signal: abortController.signal })
        .then(async (response) => {
          const json = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(json?.error || `${fallbackError} (${response.status})`);
          }
          return json as { days?: Day[] };
        })
        .then((payload) => setState({ status: "ready", days: payload.days ?? [], error: null, url }))
        .catch((error: unknown) => {
          if ((error as Error)?.name === "AbortError") return;
          setState({
            status: "error",
            days: [],
            error: (error as Error)?.message ?? fallbackError,
            url,
          });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [url, fallbackError]);

  if (!url) return { status: "idle", days: [], error: null };
  // While a new view is searched, keep the previous days so the scrubber doesn't flicker.
  if (state.url !== url) return { status: "loading", days: state.days, error: null };
  return { status: state.status, days: state.days, error: state.error };
}

export function useClearScenes(bounds: GeoBounds | null, enabled: boolean): ClearScenesState {
  const key = enabled ? bboxKey(bounds) : null;
  return useDays<ClearSceneDay>(key ? `/api/imagery/clear-scenes?bbox=${key}` : null, "Imagery search failed");
}

/** Open-Meteo cloud cover at the view center near the VIIRS pass, for true color. */
export function useCloudCoverDays(bounds: GeoBounds | null, enabled: boolean): DaysState<CloudCoverDay> {
  // ~1 km rounding so small pans reuse the same lookup.
  const center =
    enabled && bounds
      ? `lat=${((bounds.south + bounds.north) / 2).toFixed(2)}&lon=${((bounds.west + bounds.east) / 2).toFixed(2)}`
      : null;
  return useDays<CloudCoverDay>(center ? `/api/imagery/cloud-cover?${center}` : null, "Cloud cover lookup failed");
}
