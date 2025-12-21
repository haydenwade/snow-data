"use client";
import { useCallback } from "react";
import type { Unit } from "./utils";

export default function Header({ unit, range, loading, onUnit, onRange, onRefresh }: {
  unit: Unit;
  range: 15 | 30;
  loading: boolean;
  onUnit: (u: Unit) => void;
  onRange: (r: 15 | 30) => void;
  onRefresh: () => void;
}) {
  const setIn = useCallback(() => onUnit("in"), [onUnit]);
  const setMm = useCallback(() => onUnit("mm"), [onUnit]);

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-slate-900/70 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alta Snow Report</h1>
          <div className="text-sm text-slate-400">SNOTEL + NWS forecast</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-slate-700/50">
            <button onClick={setIn} className={`px-3 py-1 text-sm ${unit === "in" ? "bg-slate-700/60" : "bg-slate-800/60"}`}>inches</button>
            <button onClick={setMm} className={`px-3 py-1 text-sm ${unit === "mm" ? "bg-slate-700/60" : "bg-slate-800/60"}`}>mm</button>
          </div>
          <select value={range} onChange={(e) => onRange(Number(e.target.value) as 15 | 30)} className="bg-slate-800/60 border border-slate-700/50 text-sm rounded px-2 py-1">
            <option value={15}>Past 15 days</option>
            <option value={30}>Past 30 days</option>
          </select>
          <button onClick={onRefresh} className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500">{loading ? "Refreshing..." : "Refresh"}</button>
        </div>
      </div>
    </header>
  );
}
