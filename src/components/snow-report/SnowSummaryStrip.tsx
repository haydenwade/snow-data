"use client";
import { useMemo } from "react";
import type { HistoricDay, ForecastDaily, Unit } from "./utils";

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }

export default function SnowSummaryStrip({ historic, forecast, unit }: { historic: HistoricDay[]; forecast: ForecastDaily[]; unit: Unit }) {
  const last15 = historic.slice(-15);
  const buckets = useMemo(() => {
    const vals = last15.map((d) => d.derivedSnowfallIn);
    const toUnit = (v: number) => unit === "in" ? v : v * 25.4;
    const prev11_15 = sum(vals.slice(0, 5));
    const prev6_10 = sum(vals.slice(5, 10));
    const prev1_5 = sum(vals.slice(10, 15));
    const last24 = vals.at(-1) ?? 0;
    const next1_5 = sum(forecast.slice(0, 5).map((d) => d.snowIn));
    const next6_7 = sum(forecast.slice(5, 7).map((d) => d.snowIn));
    return {
      prev11_15: toUnit(prev11_15),
      prev6_10: toUnit(prev6_10),
      prev1_5: toUnit(prev1_5),
      last24: toUnit(last24),
      next1_5: toUnit(next1_5),
      next6_7: toUnit(next6_7),
    };
  }, [historic, forecast, unit]);

  const fmt = (v: number) => unit === "in" ? `${v.toFixed(1)} in` : `${v.toFixed(0)} mm`;

  const item = (label: string, val: number, tone: "historic" | "future") => (
    <div className={`flex flex-col items-start rounded-lg px-3 py-2 shadow border ${tone === "historic" ? "bg-orange-500/10 border-orange-500/30" : "bg-blue-500/10 border-blue-500/30"}`}>
      <div className={`text-[11px] uppercase tracking-wide ${tone === "historic" ? "text-orange-300" : "text-blue-300"}`}>{label}</div>
      <div className={`text-xl font-bold ${tone === "historic" ? "text-orange-300" : "text-blue-300"}`}>{fmt(val)}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {item("Prev 11–15", buckets.prev11_15, "historic")}
      {item("Prev 6–10", buckets.prev6_10, "historic")}
      {item("Prev 1–5", buckets.prev1_5, "historic")}
      {item("Last 24h", buckets.last24, "historic")}
      {item("Next 1–5", buckets.next1_5, "future")}
      {item("Next 6–7", buckets.next6_7, "future")}
    </div>
  );
}
