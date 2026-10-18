import { RADAR_WMS_URL } from "@/components/stations/map-overlays";
import { RadarFramesResponse } from "@/types/radar";

// NOAA publishes a scan every ~2 min for the last ~2 hrs; the loop shows one per 10 min.
const FRAME_STEP_MS = 10 * 60_000;
const MAX_FRAMES = 12;
const CACHE_SECONDS = 60;

/** Scan times from the WMS capabilities' time dimension, oldest first. */
export function parseRadarTimes(capabilitiesXml: string): number[] {
  const match = capabilitiesXml.match(/<Dimension[^>]*name="time"[^>]*>([^<]+)<\/Dimension>/);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((value) => Date.parse(value.trim()))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
}

/**
 * The newest scan plus the last scan before each earlier 10-minute mark.
 * Marks are fixed clock times, so a refresh keeps the older frames (and
 * their cached tiles) and only adds the newest.
 */
export function pickRadarFrames(times: number[]): number[] {
  if (times.length === 0) return [];
  const latest = times[times.length - 1];
  const picked = new Set<number>([latest]);
  const lastMark = Math.floor(latest / FRAME_STEP_MS) * FRAME_STEP_MS;
  for (let step = 0; step < MAX_FRAMES - 1; step += 1) {
    const mark = lastMark - step * FRAME_STEP_MS;
    const scan = times.findLast((time) => time <= mark);
    if (scan != null && mark - scan < FRAME_STEP_MS / 2) picked.add(scan);
  }
  return [...picked].sort((a, b) => a - b);
}

export async function fetchRadarFrames(): Promise<RadarFramesResponse> {
  const response = await fetch(
    `${RADAR_WMS_URL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities`,
    { next: { revalidate: CACHE_SECONDS } },
  );
  if (!response.ok) {
    throw new Error(`NOAA radar request failed (${response.status})`);
  }
  const frames = pickRadarFrames(parseRadarTimes(await response.text()));
  if (frames.length === 0) throw new Error("NOAA radar returned no scans");
  return { frames: frames.map((time) => new Date(time).toISOString()) };
}
