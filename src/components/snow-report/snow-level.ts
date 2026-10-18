import { ForecastDaily, Unit } from "@/types/forecast";
import { metersFromFeet } from "./utils";

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

export type RainRisk = "rain" | "mix";

/**
 * Compares the NWS snow level during hours where precip is likely against the
 * station: "rain" when it stays above the station for all of those hours,
 * "mix" when it crosses the station. Only uses the true snow level, not the
 * freezing-level fallback, which sits well above where rain changes to snow.
 */
export function rainRiskAtElevation(
  day: ForecastDaily,
  elevationFt: number | null | undefined,
): RainRisk | null {
  if (elevationFt == null || !Number.isFinite(elevationFt)) return null;
  if (day.snowLevelKind !== "snow-level") return null;
  const { wetSnowLevelMinFt: min, wetSnowLevelMaxFt: max } = day;
  if (min == null || max == null) return null;
  if (min > elevationFt) return "rain";
  if (max > elevationFt) return "mix";
  return null;
}
