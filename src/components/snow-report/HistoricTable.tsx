"use client";
import { History } from "lucide-react";
import SnowCell from "./SnowCell";
import { formatDateYYYYMMDD } from "./utils";
import type { Unit, HistoricDay } from "./utils";

export default function HistoricTable({ data, unit }: { data: HistoricDay[]; unit: Unit }) {
  const rows = [...data].reverse();
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-orange-400" />
          <h2 className="font-semibold text-white">Historic Data</h2>
        </div>
      </div>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-slate-700/50">
                <th className="text-left font-medium py-2 pl-4 text-slate-400">Date</th>
                <th className="text-right font-medium py-2 text-slate-400">Snowfall</th>
                <th className="text-right font-medium py-2 pr-4 text-slate-400">Snow Depth</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.date} className="border-t border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 pl-4 text-slate-300 font-medium">{formatDateYYYYMMDD(d.date)}</td>
                  <td className="py-2 text-right"><SnowCell valueInInches={d.derivedSnowfallIn} unit={unit} tone="historic" /></td>
                  <td className="py-2 pr-4 text-right text-slate-400">{d.snowDepth != null ? `${d.snowDepth.toFixed(0)}"` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
