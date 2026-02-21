"use client";

import { ForecastDaily } from "@/types/forecast";
import { SnotelForecastSummary } from "@/types/station";
import { GitCompareArrows } from "lucide-react";

function getProbabilityValue(
  row: SnotelForecastSummary,
  probability: string,
) {
  const value = row.forecastValues?.[probability];
  if (value == null || Number.isNaN(value)) return "—";
  return String(value);
}

function formatPeriod(period: string[] | null) {
  if (!period || period.length < 2) return "—";
  return `${period[0]} to ${period[1]}`;
}

export default function ForecastComparisonPanel({
  nwsForecast,
  snotelForecast,
  loading,
}: {
  nwsForecast: ForecastDaily[];
  snotelForecast: SnotelForecastSummary[];
  loading: boolean;
}) {
  if (loading) return null;

  const probabilities = Array.from(
    new Set(
      snotelForecast.flatMap((row) => Object.keys(row.forecastValues ?? {})),
    ),
  ).sort((a, b) => Number(a) - Number(b));

  return (
    <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
        <GitCompareArrows className="h-5 w-5 text-emerald-400" />
        <h2 className="font-semibold text-white">
          Forecast Comparison (Temporary)
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 p-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700/50 text-sm font-medium text-slate-200">
            NWS Daily Forecast
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-slate-400">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-right px-3 py-2">Snow (in)</th>
                  <th className="text-right px-3 py-2">PoP %</th>
                </tr>
              </thead>
              <tbody>
                {nwsForecast.slice(0, 8).map((day) => (
                  <tr key={day.date} className="border-t border-slate-700/30">
                    <td className="px-3 py-2 text-slate-200">{day.date}</td>
                    <td className="px-3 py-2 text-right text-slate-100">
                      {day.snowIn.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-300">
                      {day.pop}
                    </td>
                  </tr>
                ))}
                {nwsForecast.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-400" colSpan={3}>
                      No NWS forecast available.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-900/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700/50 text-sm font-medium text-slate-200">
            SNOTEL Forecast API
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-slate-400">
                <tr>
                  <th className="text-left px-3 py-2">Element</th>
                  <th className="text-left px-3 py-2">Period</th>
                  {probabilities.slice(0, 3).map((prob) => (
                    <th key={prob} className="text-right px-3 py-2">
                      P{prob}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snotelForecast.slice(0, 12).map((row, idx) => (
                  <tr key={`${row.issueDate}-${idx}`} className="border-t border-slate-700/30">
                    <td className="px-3 py-2 text-slate-200">
                      {row.elementCode ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {formatPeriod(row.forecastPeriod)}
                    </td>
                    {probabilities.slice(0, 3).map((prob) => (
                      <td key={`${idx}-${prob}`} className="px-3 py-2 text-right text-slate-100">
                        {getProbabilityValue(row, prob)}
                      </td>
                    ))}
                  </tr>
                ))}
                {snotelForecast.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-slate-400"
                      colSpan={2 + Math.max(probabilities.slice(0, 3).length, 1)}
                    >
                      No AWDB forecast records returned for this station.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
