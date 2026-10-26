export type HlsProduct = "S30" | "L30";

/** Best (least cloudy) HLS scene for one UTC day inside the requested box. */
export type ClearSceneDay = {
  date: string; // YYYY-MM-DD (UTC acquisition day)
  product: HlsProduct;
  cloudPct: number | null; // scene-level cloud cover, not box-specific
  sceneCount: number;
};

export type ClearScenesResponse = {
  days: ClearSceneDay[]; // newest first
  windowDays: number;
  truncated: boolean;
};

/** Model cloud cover near the VIIRS afternoon pass for one local day. */
export type CloudCoverDay = {
  date: string; // YYYY-MM-DD (local day)
  cloudPct: number | null;
};

export type CloudCoverResponse = {
  days: CloudCoverDay[]; // newest first
};

export type SnowDepthPointResponse = {
  covered: boolean; // false outside the CONUS SNODAS grid
  depthIn: number | null;
  sweIn: number | null;
  validTime: string | null; // ISO, NOHRSC analysis valid time
};

export type SnowpackProfileStation = {
  id: string;
  name: string;
  elevationFt: number;
  distanceMiles: number;
  snowDepthIn: number;
  observedDate: string;
  isCurrentStation: boolean;
};

export type SnowpackProfileResponse = {
  radiusMiles: number;
  stations: SnowpackProfileStation[];
};
