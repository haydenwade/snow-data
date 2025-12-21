"use client";
import { CloudSnow } from "lucide-react";
import SnowCell from "./SnowCell";
import { formatDateYYYYMMDD } from "./utils";
import type { Unit, ForecastDaily } from "./utils";

export default function ForecastTable({ data, unit }: { data: ForecastDaily[]; unit: Unit }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <CloudSnow className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">Forecast Details</h2>
        </div>
      </div>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-slate-700/50">
                <th className="text-left font-medium py-2 pl-4 text-slate-400">Date</th>
                <th className="text-right font-medium py-2 text-slate-400">Snow</th>
                <th className="text-right font-medium py-2 text-slate-400">PoP</th>
                <th className="text-right font-medium py-2 pr-4 text-slate-400">Temp</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => (
                <tr key={d.date} className="border-t border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 pl-4 text-slate-300 font-medium">
                    <div className="flex items-center">
                      {formatDateYYYYMMDD(d.date)}
                      {idx === 0 && (
                        <span className="ml-2 bg-blue-500/20 text-blue-300 text-[10px] rounded px-1.5 py-0.5">Today</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-right"><SnowCell valueInInches={d.snowIn} unit={unit} tone="forecast" /></td>
                  <td className="py-2 text-right">
                    <span className={`font-medium ${d.pop >= 70 ? 'text-blue-300' : d.pop >= 40 ? 'text-blue-400' : 'text-slate-500'}`}>{d.pop}%</span>
                  </td>
                  <td className="py-2 pr-4 text-right text-slate-400 text-sm">{d.tMinF != null && d.tMaxF != null ? `${Math.round(d.tMaxF)}° / ${Math.round(d.tMinF)}°` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
