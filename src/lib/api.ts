import { HistoricDay } from "@/types/historic";
import { ForecastGridData } from "@/types/forecast";
import { StationDetailResponse } from "@/types/station";

export async function fetchHistoric(
  stationKey: string,
  days: number
): Promise<HistoricDay[]> {
  const req = await fetch(
    `/api/stations/${encodeURIComponent(stationKey)}/historic?days=${days}`,
    { cache: "no-store" }
  );
  if (!req.ok) {
    let detail = "";
    try {
      const j = await req.json();
      detail = j?.error || JSON.stringify(j);
    } catch {}
    throw new Error(
      `Historic fetch failed: ${req.status}${detail ? ` — ${detail}` : ""}`
    );
  }
  const res = await req.json();
  return res.data;
}

export async function fetchStationDetail(
  stationKey: string
): Promise<StationDetailResponse> {
  const response = await fetch(`/api/stations/${encodeURIComponent(stationKey)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "";
    try {
      const json = await response.json();
      detail = json?.error || JSON.stringify(json);
    } catch {}
    throw new Error(
      `Station fetch failed: ${response.status}${detail ? ` — ${detail}` : ""}`
    );
  }

  return (await response.json()) as StationDetailResponse;
}

export async function fetchForecastGrid(
  lat: number,
  lon: number
): Promise<ForecastGridData> {
  const res = await fetch(
    `/api/forecasts/nws?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error || JSON.stringify(j);
    } catch {}
    throw new Error(
      `Forecast fetch failed: ${res.status}${detail ? ` — ${detail}` : ""}`
    );
  }
  const j = await res.json();
  return j as ForecastGridData;
}
