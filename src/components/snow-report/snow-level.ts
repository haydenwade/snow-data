import { ForecastDaily, Unit } from "@/types/forecast";
import { metersFromFeet } from "./utils";

const RAIN_RISK_MIN_POP = 30;

function formatLevel(feet: number, unit: Unit) {
  if (unit === "mm") return metersFromFeet(feet).toLocaleString("en-US");
  // Snow level forecasts are coarse; round to the nearest 100 ft.
  return (Math.round(feet / 100) * 100).toLocaleString("en-US");
}

export function snowLevelLabel(day: Pick<ForecastDaily, "snowLevelKind">) {
  return day.snowLevelKind === "freezing-level" ? "Freezing lvl" : "Snow level";
}

/** "6,500–8,000 ft", or null when the forecast has no level data. */
export function formatSnowLevelRange(
  day: Pick<ForecastDaily, "snowLevelMinFt" | "snowLevelMaxFt">,
  unit: Unit,
) {
  const { snowLevelMinFt: min, snowLevelMaxFt: max } = day;
  if (min == null || max == null) return null;
  const suffix = unit === "mm" ? "m" : "ft";
  const low = formatLevel(min, unit);
  const high = formatLevel(max, unit);
  return low === high ? `${low} ${suffix}` : `${low}–${high} ${suffix}`;
}

/**
 * Precipitation is likely and the NWS snow level rises above the station, so
 * some of it may fall as rain there. Only uses the true snow level, not the
 * freezing-level fallback, which sits well above where rain changes to snow.
 */
export function isRainRiskAtElevation(day: ForecastDaily, elevationFt: number | null | undefined) {
  if (elevationFt == null || !Number.isFinite(elevationFt)) return false;
  if (day.snowLevelKind !== "snow-level" || day.snowLevelMaxFt == null) return false;
  return day.pop >= RAIN_RISK_MIN_POP && day.snowLevelMaxFt > elevationFt;
}
