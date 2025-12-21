"use client";
import { useMemo } from "react";
import type { HistoricDay, ForecastDaily, Unit } from "./utils";

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }

export default function SnowSummaryStrip({ historic, forecast, unit }: { historic: HistoricDay[]; forecast: ForecastDaily[]; unit: Unit }) {
  const useMetric = unit === "mm";
  const last15 = historic.slice(-15); // ascending order

  const buckets = useMemo(() => {
    const vals = last15.map((d) => d.derivedSnowfallIn);
    const prev11_15 = sum(vals.slice(0, 5));
    const prev6_10 = sum(vals.slice(5, 10));
    const prev1_5 = sum(vals.slice(10, 15));
    const last24 = vals.at(-1) ?? 0;
    const next1_5 = sum(forecast.slice(0, 5).map((d) => d.snowIn));
    const next6_7 = sum(forecast.slice(5, 7).map((d) => d.snowIn));
    return { prev11_15, prev6_10, prev1_5, last24, next1_5, next6_7 };
  }, [historic, forecast]);

  const formatSnow = (value: number) => {
    if (useMetric) return `${Math.round(value * 25.4)}`;
    return value.toFixed(1);
  };
  const unitLabel = useMetric ? "mm" : '"';

  const summaryItems = [
    { label: "Prev 11-15 Days", value: buckets.prev11_15, type: "historic" as const },
    { label: "Prev 6-10 Days", value: buckets.prev6_10, type: "historic" as const },
    { label: "Prev 1-5 Days", value: buckets.prev1_5, type: "historic" as const },
    { label: "Last 24 Hours", value: buckets.last24, type: "current" as const, highlight: true },
    { label: "Next 1-5 Days", value: buckets.next1_5, type: "forecast" as const },
    { label: "Next 6-7 Days", value: buckets.next6_7, type: "forecast" as const },
  ];

  const getBarData = (idx: number) => {
    if (idx === 3) return [buckets.last24];
    if (idx < 3) {
      // Historic buckets: slice groups from last15
      const group = idx === 0 ? last15.slice(0, 5) : idx === 1 ? last15.slice(5, 10) : last15.slice(10, 15);
      return group.map((d) => d.derivedSnowfallIn).reverse();
    }
    // Forecast
    const groupF = idx === 4 ? forecast.slice(0, 5) : forecast.slice(5, 7);
    return groupF.map((d) => d.snowIn);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 overflow-x-auto">
      <h2 className="font-semibold text-white mb-4 text-sm">Snow Summary</h2>
      <div className="flex gap-2 min-w-max">
        {summaryItems.map((item, idx) => {
          const barData = getBarData(idx);
          const maxBar = Math.max(...barData, 1);
          const isForecast = item.type === "forecast";
          return (
            <div
              key={idx}
              className={`flex-1 min-w-[120px] rounded-xl p-3 transition-all ${
                item.highlight ? "bg-slate-700/80 border-2 border-orange-500/50 ring-2 ring-orange-500/20" : "bg-slate-700/30 border border-slate-600/30"
              }`}
            >
              <p className={`text-xs font-medium mb-2 ${isForecast ? "text-blue-400" : "text-slate-400"}`}>{item.label}</p>
              <div className="flex items-end gap-0.5 h-10 mb-2">
                {barData.map((val, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${isForecast ? "bg-blue-500/80" : val > 0 ? "bg-orange-500/80" : "bg-slate-600/50"}`}
                    style={{ height: `${Math.max((val / maxBar) * 100, val > 0 ? 15 : 5)}%`, minHeight: "2px" }}
                  />
                ))}
              </div>
              <p className={`text-2xl font-bold ${item.highlight ? "text-orange-400" : isForecast ? "text-blue-400" : "text-white"}`}>
                {formatSnow(item.value)}<span className="text-sm font-normal">{unitLabel}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
