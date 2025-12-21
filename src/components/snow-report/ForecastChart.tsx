"use client";
import { CloudSnow } from "lucide-react";
import type { Unit } from "./utils";

export default function ForecastChart({ labels, values, pops, unit }: { labels: string[]; values: number[]; pops: number[]; unit: Unit }) {
  const toUnit = (v: number) => unit === "in" ? v : v * 25.4;
  const displayMax = Math.max(1, ...values.map(toUnit));
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2"><CloudSnow className="w-4 h-4 text-blue-400" /> <span className="text-blue-300">Next 7 days forecast</span></h3>
      </div>
      <div className="p-4">
        <div className="w-full">
          <div className="flex items-end gap-2 h-40">
            {values.map((v, i) => {
              const h = (toUnit(v) / displayMax) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full bg-slate-800 rounded">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded" style={{ height: `${h}%` }} />
                    <div className="h-40" />
                  </div>
                  <div className="text-[10px] text-slate-400">{labels[i].slice(5)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-400">Max: {displayMax.toFixed(unit === "in" ? 1 : 0)} {unit}</div>
          <div className="mt-3 flex items-center justify-between gap-2">
            {pops.map((p, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">{p}%</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
