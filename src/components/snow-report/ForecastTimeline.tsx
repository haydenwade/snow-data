"use client";;
import { Sun, CloudSun, Cloud, Wind, CloudSnow, Cloudy } from "lucide-react";
import SnowCell from "./SnowCell";
import type { ForecastDaily, Unit } from "./utils";
import { formatDateYYYYMMDD, degToCompass, skyCoverLabel } from "./utils";

// using degToCompass and skyCoverLabel from utils

function SkyIcon({ p }: { p?: number }) {
  if (p == null || Number.isNaN(p)) return <Cloud className="text-slate-300" />;
  if (p <= 10) return <Sun className="text-yellow-400" />;
  if (p <= 35) return <CloudSun className="text-yellow-300" />;
  if (p <= 65) return <Cloud className="text-slate-300" />;
  if (p <= 90) return <Cloudy className="text-slate-400" />;
  return <CloudSnow className="text-slate-400" />;
}

export default function ForecastTimeline({ data, unit }: { data: ForecastDaily[]; unit: Unit }) {
  const slice = data.length > 1 ? data.slice(1, 8) : data.slice(0, 7);
  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <CloudSnow className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">7-Day Forecast</h2>
        </div>
      </div>
      <div className="p-3 overflow-x-auto">
        <div className="flex gap-3">
        {slice.map((d) => (
          <div key={d.date} className="flex-shrink-0 w-40 bg-slate-800/20 rounded-md p-3 flex flex-col items-start gap-2">
            <div className="w-full">
              <div className="text-sm text-slate-300 font-medium">{formatDateYYYYMMDD(d.date)}</div>
            </div>

            <div className="w-full flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-700/30 text-slate-100">
                <SkyIcon p={d.skyCoverPercent} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-100">{skyCoverLabel(d.skyCoverPercent)}</div>
              </div>
            </div>

            <div className="w-full flex items-center justify-between">
              <div className="text-sm text-slate-300">Snow</div>
              <div className="text-sm">
                <SnowCell valueInInches={d.snowIn} unit={unit} tone="forecast" />
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-slate-300" />
                {d.windMph != null ? (
                  unit === "mm" ? (
                    <span className="font-medium">{Math.round(d.windMph * 1.60934)} kph</span>
                  ) : (
                    <span className="font-medium">{d.windMph} mph</span>
                  )
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>
              <div className="text-xs text-slate-400">{degToCompass(d.windDirDeg)}</div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
