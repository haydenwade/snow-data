"use client";
import { History } from "lucide-react";
import type { Unit } from "./utils";

export default function HistoricChart({ labels, values, unit }: { labels: string[]; values: number[]; unit: Unit }) {
  const toUnit = (v: number) => unit === "in" ? v : v * 25.4;
  const displayMax = Math.max(1, ...values.map(toUnit));
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2"><History className="w-4 h-4 text-orange-400" /> <span className="text-orange-400">Past 15 days</span></h3>
      </div>
      <div className="p-4">
        <div className="w-full">
          <div className="flex items-end gap-2 h-40">
            {values.map((v, i) => {
              const h = (toUnit(v) / displayMax) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full bg-slate-800 rounded">
                    <div className="absolute bottom-0 left-0 right-0 bg-orange-500 rounded" style={{ height: `${h}%` }} />
                    <div className="h-40" />
                  </div>
                  <div className="text-[10px] text-slate-400">{labels[i].slice(5)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-400">Max: {displayMax.toFixed(unit === "in" ? 1 : 0)} {unit}</div>
        </div>
      </div>
    </div>
  );
}
