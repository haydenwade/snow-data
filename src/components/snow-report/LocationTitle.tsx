"use client";
import { useCallback } from "react";
import Link from "next/link";
import { Mountain, Radar, Snowflake } from "lucide-react";
import { usePathname } from "next/navigation";
import { Unit } from "@/types/forecast";
import { MountainLocation } from "@/types/location";
import FavoriteButton from "@/components/FavoriteButton";

type LocationTitleProps = {
  unit: Unit;
  range: 15 | 30;
  onUnit: (u: Unit) => void;
  onRange: (r: 15 | 30) => void;
  location: MountainLocation;
};

export default function LocationTitle({
  unit,
  range,
  onUnit,
  onRange,
  location,
}: LocationTitleProps) {
  const setIn = useCallback(() => onUnit("in"), [onUnit]);
  const setMm = useCallback(() => onUnit("mm"), [onUnit]);
  const stationName = location?.name ?? "Station X";
  const pathname = usePathname();

  return (
    <div className="bg-slate-900/70">
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
        {/* Top branding row */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1">
              <Link
                href="/"
                aria-label="Home"
                className="relative inline-block focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              >
                {location.logoUrl ? (
                  <div className="relative bg-white p-2 rounded-2xl flex items-center justify-center w-14 h-14 border border-slate-200">
                    <img
                      src={location.logoUrl}
                      alt={stationName + " logo"}
                      className="max-h-10 max-w-10 object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-2xl">
                      <Snowflake className="h-8 w-8 text-white" />
                    </div>
                  </>
                )}
              </Link>
              <FavoriteButton locationId={location.id} size="md" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {stationName}
              </h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-1">
                <span className="flex items-center text-slate-400 text-sm">
                  <Mountain className="h-4 w-4" />
                  <span className="ml-1">SNOTEL + NWS Forecast Data</span>
                </span>
                <a
                  href={location.radarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open NWS Radar Map"
                  className="inline-flex items-center"
                >
                  <Radar className="h-4 w-4 text-blue-400" />
                  <span className="ml-1 text-blue-400 text-sm hover:underline flex items-center">
                    NWS Radar
                  </span>
                </a>
              </div>
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
              <button
                onClick={setIn}
                className={`px-4 py-2 text-sm transition-colors ${
                  unit === "in"
                    ? "bg-slate-700/70 text-white"
                    : "bg-slate-800/60 text-slate-300"
                }`}
              >
                Imperial
              </button>
              <button
                onClick={setMm}
                className={`px-4 py-2 text-sm transition-colors ${
                  unit === "mm"
                    ? "bg-slate-700/70 text-white"
                    : "bg-slate-800/60 text-slate-300"
                }`}
              >
                Metric
              </button>
            </div>
            {/* Range select */}
            {pathname.includes("historic") && (
              <select
                value={range}
                onChange={(e) => onRange(Number(e.target.value) as 15 | 30)}
                className="px-4 py-2 text-sm rounded-xl bg-transparent border border-slate-700/50 text-slate-200"
              >
                <option value={15}>Past 15 days</option>
                <option value={30}>Past 30 days</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
