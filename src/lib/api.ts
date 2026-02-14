import { HistoricDay } from "@/types/historic";
import { ForecastGridData } from "@/types/forecast";

export async function fetchHistoric(
  locationId: string,
  days: number
): Promise<HistoricDay[]> {
  const req = await fetch(
    `/api/historic?locationId=${locationId}&days=${days}`,
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

export async function fetchForecastGrid(
  locationId: string
): Promise<ForecastGridData> {
  const res = await fetch(`/api/forecast?locationId=${locationId}`, {
    cache: "no-store",
  });
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
