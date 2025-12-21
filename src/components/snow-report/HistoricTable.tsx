"use client";
import { useState, useRef, useEffect } from "react";
import { History, Info } from "lucide-react";
import SnowCell from "./SnowCell";
import { formatDateYYYYMMDD } from "./utils";
import type { Unit, HistoricDay } from "./utils";

export default function HistoricTable({
  data,
  unit,
}: {
  data: HistoricDay[];
  unit: Unit;
}) {
  // `data` is already in the desired order (descending) from the page, so render as-is
  const rows = data;
  function InfoButton() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      function onDoc(e: MouseEvent) {
        if (!ref.current) return;
        if (e.target instanceof Node && !ref.current.contains(e.target))
          setOpen(false);
      }
      function onKey(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("click", onDoc);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("click", onDoc);
        document.removeEventListener("keydown", onKey);
      };
    }, []);

    return (
      <div className="relative" ref={ref}>
        <button
          aria-expanded={open}
          aria-controls="historic-snowdepth-info"
          onClick={() => setOpen((s) => !s)}
          className="p-1 rounded-full hover:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Explain Snow Depth"
        >
          <Info className="h-4 w-4 text-slate-400" />
        </button>
        {open && (
          <div
            id="historic-snowdepth-info"
            role="dialog"
            aria-label="Snow depth help"
            className="absolute right-0 mt-2 w-64 bg-slate-800/80 border border-slate-700/50 text-xs text-slate-300 p-3 rounded shadow-lg z-20"
          >
            <div className="font-medium text-slate-200 mb-1">
              Snow Depth (start of day)
            </div>
            <div className="leading-tight">
              This shows the measured snow depth at the start of the calendar
              day (reported by the station). "Snowfall" is the derived new snow
              during the day (positive increases in depth).
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-orange-400" />
          <h2 className="font-semibold text-white">Historic Data</h2>
        </div>
      </div>
      <div className="p-0">
        {/* Single table with sticky header to keep columns perfectly aligned */}
        <div className="overflow-x-auto overflow-y-auto h-100">
          <table className="min-w-full text-sm table-fixed">
            <thead className="sticky top-0 z-10 bg-slate-800/70 backdrop-blur-sm">
              <tr className="border-slate-700/50">
                <th className="text-left font-medium py-2 pl-4 text-slate-400">
                  Date
                </th>
                <th className="text-right font-medium py-2 text-slate-400">
                  Snowfall
                </th>
                <th className="text-right font-medium py-2 pr-4 text-slate-400">
                  <div className="flex items-center justify-end gap-2">
                    <span>Snow Depth</span>
                    <div className="relative">
                      <InfoButton />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr
                  key={d.date}
                  className="border-t border-slate-700/30 hover:bg-slate-700/20"
                >
                  <td className="py-2 pl-4 text-slate-300 font-medium">
                    {formatDateYYYYMMDD(d.date)}
                  </td>
                  <td className="py-2 text-right">
                    <SnowCell
                      valueInInches={d.derivedSnowfall!}
                      unit={unit}
                      tone="historic"
                    />
                  </td>
                  <td className="py-2 pr-4 text-right text-slate-400">
                    {d.snowDepthAtStartOfDay != null
                      ? unit === "mm"
                        ? `${Math.round(d.snowDepthAtStartOfDay * 25.4)} mm`
                        : `${d.snowDepthAtStartOfDay!.toFixed(0)}"`
                      : "—"}
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
