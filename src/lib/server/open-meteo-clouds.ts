import { CloudCoverDay, CloudCoverResponse } from "@/types/imagery";

// Model cloud cover at the hour nearest the VIIRS afternoon pass (~1:30 pm
// local). A proxy for whether that day's true color image is clear; it is a
// weather model, not the satellite's own cloud mask.
const PASS_HOUR_LOCAL = 13;
export const CLOUD_COVER_WINDOW_DAYS = 30;
const CACHE_SECONDS = 3600;

type OpenMeteoCloudResponse = {
  utc_offset_seconds?: number;
  hourly?: { time?: number[]; cloud_cover?: Array<number | null> };
};

/** One day per local date at the pass hour, newest first, skipping hours not yet reached. */
export function pickPassHourCloud(json: OpenMeteoCloudResponse, now = new Date()): CloudCoverDay[] {
  const offsetMs = (json.utc_offset_seconds ?? 0) * 1000;
  const times = json.hourly?.time ?? [];
  const clouds = json.hourly?.cloud_cover ?? [];
  const days: CloudCoverDay[] = [];
  times.forEach((seconds, index) => {
    const utcMs = seconds * 1000;
    if (utcMs > now.getTime()) return;
    const local = new Date(utcMs + offsetMs).toISOString();
    if (Number(local.slice(11, 13)) !== PASS_HOUR_LOCAL) return;
    const value = clouds[index];
    days.push({ date: local.slice(0, 10), cloudPct: Number.isFinite(value) ? (value as number) : null });
  });
  return days.reverse();
}

export async function fetchCloudCoverDays(latitude: number, longitude: number): Promise<CloudCoverResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: "cloud_cover",
    past_days: String(CLOUD_COVER_WINDOW_DAYS),
    forecast_days: "1",
    timezone: "auto",
    timeformat: "unixtime",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!response.ok) throw new Error(`Open-Meteo request failed (${response.status})`);
  const json = (await response.json()) as OpenMeteoCloudResponse;
  return { days: pickPassHourCloud(json) };
}
