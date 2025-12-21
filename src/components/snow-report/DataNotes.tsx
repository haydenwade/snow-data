"use client";

import { Info, Database, Cloud } from "lucide-react";

export default function DataNotes() {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-medium text-slate-400">Data Notes & Methodology</h3>
      </div>

      {/* Simple, accessible accordion using <details> */}
      <div className="space-y-2">
        <details className="group border border-slate-700/30 rounded-lg">
          <summary className="cursor-pointer list-none px-3 py-2 text-sm text-slate-300 hover:text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-orange-400" />
            <span>Historic Data (SNOTEL)</span>
            <span className="ml-auto text-slate-500 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-3 pb-3 text-xs text-slate-400 space-y-2">
            <p>
              <strong className="text-slate-300">Data Source:</strong> USDA Natural Resources Conservation Service (NRCS) SNOTEL network, Station #1308 at Alta, Utah.
            </p>
            <p>
              <strong className="text-slate-300">WTEQ (Snow Water Equivalent):</strong> The amount of water contained within the snowpack, measured in inches. This represents how much water would result if the snowpack melted.
            </p>
            <p>
              <strong className="text-slate-300">SNWD (Snow Depth):</strong> The total depth of snow on the ground, measured in inches.
            </p>
            <p>
              <strong className="text-slate-300">Daily Snowfall Calculation:</strong> Since SNOTEL doesn't directly report new snowfall, daily totals are derived from positive changes in snow depth between consecutive days. Negative changes (settlement/melt) are recorded as 0" new snow.
            </p>
          </div>
        </details>

        <details className="group border border-slate-700/30 rounded-lg">
          <summary className="cursor-pointer list-none px-3 py-2 text-sm text-slate-300 hover:text-white flex items-center gap-2">
            <Cloud className="h-4 w-4 text-blue-400" />
            <span>Forecast Data (NWS)</span>
            <span className="ml-auto text-slate-500 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-3 pb-3 text-xs text-slate-400 space-y-2">
            <p>
              <strong className="text-slate-300">Data Source:</strong> National Weather Service (NWS) via api.weather.gov, using gridpoint data for coordinates 40.59°N, 111.64°W.
            </p>
            <p>
              <strong className="text-slate-300">Snowfall Amount:</strong> Forecast snow accumulation from NWS gridpoint data. Original values in millimeters are converted to inches (÷25.4) and aggregated into daily totals.
            </p>
            <p>
              <strong className="text-slate-300">PoP (Probability of Precipitation):</strong> The maximum probability of precipitation for each forecast period within the day.
            </p>
            <p>
              <strong className="text-slate-300">Daily Aggregation:</strong> NWS provides data in variable time windows. These are grouped by calendar day (America/Denver timezone) and summed for daily totals.
            </p>
          </div>
        </details>
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center">
        Data refreshed from live sources. Forecast accuracy decreases beyond 3 days.
      </p>
    </div>
  );
}
