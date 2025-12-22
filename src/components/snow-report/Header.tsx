"use client";
import { useCallback } from "react";
import Link from "next/link";
import { Mountain, Snowflake } from "lucide-react";
import type { Location, Unit } from "./utils";
import { usePathname } from "next/navigation";

type HeaderProps = {
  unit: Unit;
  range: 15 | 30;
  onUnit: (u: Unit) => void;
  onRange: (r: 15 | 30) => void;
  location: Location;
};

export default function Header({ unit, range, onUnit, onRange, location }: HeaderProps) {
  const setIn = useCallback(() => onUnit("in"), [onUnit]);
  const setMm = useCallback(() => onUnit("mm"), [onUnit]);
  const stationName = location?.name ?? "Station X";
  const pathname = usePathname();

  return (
    <div className="bg-slate-900/70 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
        {/* Top branding row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Home" className="relative inline-block focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-2xl">
                <Snowflake className="h-8 w-8 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Snow Report | {stationName}
              </h1>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                SNOTEL + NWS Forecast Data
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-400">Live Data</span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {/* Unit toggle */}
            <div className="inline-flex rounded-xl overflow-hidden border border-slate-700/50">
              <button onClick={setIn} className={`px-4 py-2 text-sm transition-colors ${unit === 'in' ? 'bg-slate-700/70 text-white' : 'bg-slate-800/60 text-slate-300'}`}>Imperial</button>
              <button onClick={setMm} className={`px-4 py-2 text-sm transition-colors ${unit === 'mm' ? 'bg-slate-700/70 text-white' : 'bg-slate-800/60 text-slate-300'}`}>Metric</button>
            </div>
            {/* Range select */}
            {pathname.includes('historic') &&<select value={range} onChange={(e) => onRange(Number(e.target.value) as 15 | 30)} className="px-4 py-2 text-sm rounded-xl bg-transparent border border-slate-700/50 text-slate-200">
              <option value={15}>Past 15 days</option>
              <option value={30}>Past 30 days</option>
            </select>
}
          </div>

        </div>
      </div>
    </div>
  );
}
