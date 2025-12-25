"use client";
import { CloudSnow } from "lucide-react";
import SnowCell from "./SnowCell";
import { formatDateYYYYMMDD, degToCompass, skyCoverLabel } from "./utils";
import ForecastTableSkeleton from "../skeletons/ForecastTableSkeleton";
import { ForecastDaily, Unit } from "@/types/forecast";

export default function ForecastTable({
  data,
  unit,
  loading,
}: {
  data: ForecastDaily[];
  unit: Unit;
  loading: boolean;
}) {
  if (loading || data.length === 0) {
    return <ForecastTableSkeleton />;
  }
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
          <table className="min-w-max text-sm">
            <thead className="sticky top-0 z-10 bg-slate-800/70 backdrop-blur-sm">
              <tr className="border-slate-700/50">
                <th className="text-left font-medium py-2 pl-4 text-slate-400 w-36 whitespace-nowrap">
                  Date
                </th>
                <th className="text-right font-medium py-2 text-slate-400 w-32 whitespace-nowrap">
                  Snow
                </th>
                <th className="text-right font-medium py-2 text-slate-400 w-24 whitespace-nowrap">
                  PoP
                </th>
                <th className="text-right font-medium py-2 pr-4 text-slate-400 w-36 whitespace-nowrap">
                  Temp ({unit === "mm" ? "°C" : "°F"})
                </th>
                <th className="text-center font-medium py-2 text-slate-400 w-40 whitespace-nowrap">
                  Wind ({unit === "mm" ? "kph" : "mph"})
                </th>
                <th className="text-center font-medium py-2 text-slate-400 w-36 whitespace-nowrap">
                  Sky Cover
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => (
                <tr
                  key={d.date}
                  className="border-t border-slate-700/30 hover:bg-slate-700/20"
                >
                  <td className="py-2 pl-4 text-slate-300 font-medium w-36">
                    <div className="flex items-center">
                      {formatDateYYYYMMDD(d.date)}
                      {idx === 0 && (
                        <span className="ml-2 bg-blue-500/20 text-blue-300 text-[10px] rounded px-1.5 py-0.5">
                          Today
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-right w-32 whitespace-nowrap">
                    <SnowCell
                      valueInInches={d.snowIn}
                      unit={unit}
                      tone="forecast"
                    />
                  </td>
                  <td className="py-2 text-right w-24 whitespace-nowrap">
                    <span
                      className={`font-medium ${
                        d.pop >= 70
                          ? "text-blue-300"
                          : d.pop >= 40
                          ? "text-blue-400"
                          : "text-slate-500"
                      }`}
                    >
                      {d.pop}%
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right text-slate-400 text-sm w-36 whitespace-nowrap">
                    {unit === "mm"
                      ? d.tMinC != null && d.tMaxC != null
                        ? `${d.tMaxC}° / ${d.tMinC}°`
                        : "—"
                      : d.tMinF != null && d.tMaxF != null
                      ? `${Math.round(d.tMaxF)}° / ${Math.round(d.tMinF)}°`
                      : "—"}
                  </td>
                  <td className="py-2 text-center text-slate-400 text-sm w-40 whitespace-nowrap">
                    {d.windMph != null ? (
                      unit === "mm" ? (
                        <span className="font-medium">
                          {Math.round(d.windMph * 1.60934)} kph{" "}
                          {degToCompass(d.windDirDeg)}
                        </span>
                      ) : (
                        <span className="font-medium">
                          {d.windMph} mph {degToCompass(d.windDirDeg)}
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-2 text-center text-slate-400 text-sm w-36 whitespace-nowrap">
                    {d.skyCoverPercent != null ? (
                      <span className="font-medium">
                        {skyCoverLabel(d.skyCoverPercent)}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
