"use client";
import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import SnowSummaryStripSkeleton from "../skeletons/SnowSummaryStripSkeleton";
import { HistoricDay } from "@/types/historic";
import { ForecastDaily, Unit } from "@/types/forecast";

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

export default function SnowSummaryStrip({
  historic,
  forecast,
  unit,
  locationId,
  loading
}: {
  historic: HistoricDay[];
  forecast: ForecastDaily[];
  unit: Unit;
  locationId: string;
  loading: boolean;
}) {
  const useMetric = unit === "mm";
  const last15 = historic.slice(-15); // ascending order

  console.log('forecast', forecast);
  const todayDate = forecast[0]?.date; // YYYY-MM-DD for current day
  const buckets = useMemo(() => {
    // Use only days strictly before today for historic buckets and last24
    const historicBeforeToday = todayDate
      ? historic.filter((d) => d.date < todayDate)
      : historic;
    const last14 = historicBeforeToday.slice(-14);
    const prev8_14_vals = last14.slice(0, 7).map((d) => d.derivedSnowfall ?? 0);
    const prev1_7_vals = last14.slice(-7).map((d) => d.derivedSnowfall ?? 0);
    const prev8_14 = sum(prev8_14_vals);
    const prev1_7 = sum(prev1_7_vals);
    const last24 = (historicBeforeToday.at(-1)?.derivedSnowfall ?? 0);
    // Forecast: next 24 is today; next 1-7 excludes today
    const next24 = forecast[0]?.snowIn ?? 0;
    const next1_7 = sum(forecast.slice(1, 8).map((d) => d.snowIn));
    return { prev8_14, prev1_7, last24, next24, next1_7 };
  }, [historic, forecast, todayDate]);

  const formatSnow = (value: number) => {
    if (useMetric) return `${Math.round(value * 25.4)}`;
    return value.toFixed(1);
  };
  const unitLabel = useMetric ? "mm" : '"';

  const summaryItems = [
    {
      label: "Prev 8-14 Days",
      value: buckets.prev8_14,
      type: "historic" as const,
    },
    {
      label: "Prev 1-7 Days",
      value: buckets.prev1_7,
      type: "historic" as const,
    },
    {
      label: "Last 24 Hours",
      value: buckets.last24,
      type: "current" as const,
      highlight: true,
    },
    {
      label: "Next 24 Hours",
      value: buckets.next24,
      type: "forecast" as const,
    },
    {
      label: "Next 1-7 Days",
      value: buckets.next1_7,
      type: "forecast" as const,
    },
  ];

  // Helper to extract day-of-month from YYYY-MM-DD
  const dayOfMonth = (date: string) => {
    const parts = date.split("-");
    const day = parts[2] ?? "01";
    return parseInt(day, 10);
  };

  // Build per-bar items with value and date for labeling
  const getBarItems = (idx: number) => {
    // 0: Prev 1-7, 1: Prev 8-14, 2: Last 24 Hours, 3: Next 24 Hours, 4: Next 1-7
    const historicBeforeToday = todayDate
      ? last15.filter((d) => d.date < todayDate)
      : last15;
    if (idx === 0) {
      // Prev 8-14 in ascending date order
      const last14 = historicBeforeToday.slice(-14);
      const group = last14.slice(0, 7);
      return group.map((d) => ({ value: d.derivedSnowfall ?? 0, date: d.date }));
    }
    if (idx === 1) {
      // Prev 1-7 in ascending date order
      const group = historicBeforeToday.slice(-7);
      return group.map((d) => ({ value: d.derivedSnowfall ?? 0, date: d.date }));
    }
    if (idx === 2) {
      const d = historicBeforeToday.at(-1);
      return [
        {
          value: d?.derivedSnowfall ?? 0,
          date: d?.date ?? "",
        },
      ];
    }
    if (idx === 3) {
      const d = forecast[0];
      return [
        {
          value: d?.snowIn ?? 0,
          date: d?.date ?? "",
        },
      ];
    }
    // Next 1-7 excludes today
    const groupF = forecast.slice(1, 8);
    return groupF.map((d) => ({ value: d.snowIn, date: d.date }));
  };

  if (loading || !historic.length || !forecast.length) {
    return <SnowSummaryStripSkeleton />;
  }
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
        <CalendarDays className="h-5 w-5 text-blue-400" />
        <h2 className="font-semibold text-white">Snow Summary</h2>
      </div>
      <div className="flex gap-2 flex-wrap">
        {summaryItems.map((item, idx) => {
          const barItems = getBarItems(idx);
          const maxBar = Math.max(...barItems.map((b) => b.value), 1);
          const isForecast = item.type === "forecast";
          return (
            <div
              key={idx}
              className={`flex-1 min-w-[120px] rounded-xl p-3 transition-all ${
                item.highlight
                  ? "bg-slate-700/80 border-2 border-orange-500/50 ring-2 ring-orange-500/20"
                  : "bg-slate-700/30 border border-slate-600/30"
              }`}
            >
              <p
                className={`text-xs font-medium mb-2 ${
                  isForecast ? "text-blue-400" : "text-slate-400"
                }`}
              >
                {item.label}
              </p>
              <div className="flex items-end gap-0.5 h-10 mb-1">
                {barItems.map((bar, i) => {
                  const val = bar.value;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all ${
                        isForecast
                          ? "bg-blue-500/80"
                          : val > 0
                          ? "bg-orange-500/80"
                          : "bg-slate-600/50"
                      }`}
                      style={{
                        height: `${Math.max(
                          (val / maxBar) * 100,
                          val > 0 ? 15 : 5
                        )}%`,
                        minHeight: "2px",
                      }}
                      title={`${val.toFixed(2)} ${useMetric ? "in (raw)" : "in"} | DoM ${dayOfMonth(bar.date)}`}
                    />
                  );
                })}
              </div>
              <div className="flex gap-0.5 text-[10px] leading-tight text-slate-400">
                {barItems.map((bar, i) => {
                  const displayVal = useMetric
                    ? Math.round(bar.value * 25.4)
                    : Number.isInteger(bar.value)
                    ? bar.value
                    : parseFloat(bar.value.toFixed(1));
                  return (
                    <div key={i} className="flex-1 text-center">
                      <div className="font-medium text-slate-300">{displayVal}</div>
                      <div className="opacity-70">{dayOfMonth(bar.date)}</div>
                    </div>
                  );
                })}
              </div>
              <p
                className={`text-2xl font-bold ${
                  item.highlight
                    ? "text-orange-400"
                    : isForecast
                    ? "text-blue-400"
                    : "text-white"
                }`}
              >
                {formatSnow(item.value)}
                <span className="text-sm font-normal">{unitLabel}</span>
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <a
          href={`/location/${locationId}/historic`}
          className="inline-block px-2 py-1 rounded border border-slate-500 text-slate-400 text-sm hover:bg-slate-700/20 hover:text-slate-200 transition"
        >
          View Historic Data
        </a>
      </div>
    </div>
  );
}
