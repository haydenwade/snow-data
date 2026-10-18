import { GeoBounds } from "@/types/station";
import { ClearSceneDay, ClearScenesResponse, HlsProduct } from "@/types/imagery";

// NASA CMR granule search for the HLS Sentinel-2 (S30) and Landsat 8/9 (L30)
// collections. Keyless. Cloud cover is per 110 km HLS tile, not per box.
const CMR_GRANULES_URL = "https://cmr.earthdata.nasa.gov/search/granules.umm_json";
const COLLECTIONS: Record<HlsProduct, string> = {
  S30: "C2021957295-LPCLOUD",
  L30: "C2021957657-LPCLOUD",
};
const PAGE_SIZE = 200;
const CACHE_SECONDS = 3600;
export const CLEAR_SCENE_WINDOW_DAYS = 30;

type CmrItem = {
  umm?: {
    TemporalExtent?: { RangeDateTime?: { BeginningDateTime?: string } };
    CloudCover?: number;
    AdditionalAttributes?: Array<{ Name?: string; Values?: string[] }>;
  };
};

function cloudCoverOf(item: CmrItem) {
  const direct = item.umm?.CloudCover;
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;
  const attribute = item.umm?.AdditionalAttributes?.find((a) => a.Name === "CLOUD_COVERAGE");
  const numeric = Number(attribute?.Values?.[0]);
  return Number.isFinite(numeric) ? numeric : null;
}

async function searchProduct(product: HlsProduct, bounds: GeoBounds, startIso: string, endIso: string) {
  const params = new URLSearchParams({
    collection_concept_id: COLLECTIONS[product],
    bounding_box: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
    temporal: `${startIso},${endIso}`,
    sort_key: "-start_date",
    page_size: String(PAGE_SIZE),
  });
  const response = await fetch(`${CMR_GRANULES_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!response.ok) throw new Error(`CMR search failed (${response.status})`);
  const json = (await response.json()) as { hits?: number; items?: CmrItem[] };
  const items = Array.isArray(json.items) ? json.items : [];
  return { items, truncated: (json.hits ?? 0) > items.length };
}

export async function fetchClearScenes(bounds: GeoBounds, now = new Date()): Promise<ClearScenesResponse> {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
  const start = new Date(end.getTime() - CLEAR_SCENE_WINDOW_DAYS * 86_400_000);
  const [s30, l30] = await Promise.all([
    searchProduct("S30", bounds, start.toISOString(), end.toISOString()),
    searchProduct("L30", bounds, start.toISOString(), end.toISOString()),
  ]);

  const byDay = new Map<string, ClearSceneDay>();
  const add = (product: HlsProduct, items: CmrItem[]) => {
    for (const item of items) {
      const begin = item.umm?.TemporalExtent?.RangeDateTime?.BeginningDateTime;
      const date = typeof begin === "string" ? begin.slice(0, 10) : null;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      const cloudPct = cloudCoverOf(item);
      const existing = byDay.get(date);
      if (!existing) {
        byDay.set(date, { date, product, cloudPct, sceneCount: 1 });
        continue;
      }
      existing.sceneCount += 1;
      const isClearer =
        cloudPct != null && (existing.cloudPct == null || cloudPct < existing.cloudPct);
      if (isClearer) {
        existing.cloudPct = cloudPct;
        existing.product = product;
      }
    }
  };
  add("S30", s30.items);
  add("L30", l30.items);

  const days = Array.from(byDay.values()).sort((a, b) => b.date.localeCompare(a.date));
  return { days, windowDays: CLEAR_SCENE_WINDOW_DAYS, truncated: s30.truncated || l30.truncated };
}
