"use client";

import Link from "next/link";
import { MountainLocation } from "@/types/location";
import { Info, Database, Cloud, AlertTriangle, Map } from "lucide-react";

export default function DataNotes(props:{location:MountainLocation}) {
  const { location } = props;
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
              <strong className="text-slate-300">Data Source:</strong> USDA Natural Resources Conservation Service (NRCS) SNOTEL network, Station #{location.stationId} at {location.name}.
            </p>
            <p>
              <strong className="text-slate-300">WTEQ (Snow Water Equivalent):</strong> The amount of water contained within the snowpack, measured in inches. This represents how much water would result if the snowpack melted.
            </p>
            <p>
              <strong className="text-slate-300">SNWD (Snow Depth):</strong> The total depth of snow on the ground, measured in inches.
            </p>
            <p>
              <strong className="text-slate-300">Daily Snowfall Calculation:</strong> Since SNOTEL doesn&apos;t directly report new snowfall, daily totals are derived from positive changes in snow depth between consecutive days. Negative changes (settlement/melt) are recorded as 0&quot; new snow.
            </p>
          </div>
        </details>

        <details className="group border border-slate-700/30 rounded-lg">
          <summary className="cursor-pointer list-none px-3 py-2 text-sm text-slate-300 hover:text-white flex items-center gap-2">
            <Cloud className="h-4 w-4 text-blue-400" />
            <span>Forecast Data (NWS / Open-Meteo)</span>
            <span className="ml-auto text-slate-500 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-3 pb-3 text-xs text-slate-400 space-y-2">
            <p>
              <strong className="text-slate-300">Data Source:</strong> U.S. stations use National Weather Service (NWS) via api.weather.gov. Non-U.S. stations use Open-Meteo forecast data for coordinates {location.lat}, {location.lon}.
            </p>
            <p>
              <strong className="text-slate-300">Snowfall Amount:</strong> Forecast snowfall values are normalized to millimeters and converted to inches (÷25.4), then aggregated into daily totals.
            </p>
            <p>
              <strong className="text-slate-300">PoP (Probability of Precipitation):</strong> The maximum probability of precipitation for each forecast period within the day.
            </p>
            <p>
              <strong className="text-slate-300">Daily Aggregation:</strong> Forecast values are grouped by calendar day in local timezone and summed for daily totals.
            </p>
          </div>
        </details>

        <details className="group border border-slate-700/30 rounded-lg">
          <summary className="cursor-pointer list-none px-3 py-2 text-sm text-slate-300 hover:text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Avalanche Forecast Regions (Current / Historic)</span>
            <span className="ml-auto text-slate-500 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-3 pb-3 text-xs text-slate-400 space-y-2">
            <p>
              <strong className="text-slate-300">Data Source:</strong> Avalanche.org public map-layer data is used for regional avalanche forecast polygons and forecast metadata shown in SNOWD.
            </p>
            <p>
              <strong className="text-slate-300">Current vs Historic:</strong> Current avalanche region context uses the latest map-layer response. Historic avalanche map views request archive dates when supported by Avalanche.org endpoints.
            </p>
            <p>
              <strong className="text-slate-300">Important:</strong> SNOWD surfaces regional context and links to official forecasts. Always read the full official avalanche center forecast before traveling in avalanche terrain.
            </p>
          </div>
        </details>

        <details className="group border border-slate-700/30 rounded-lg">
          <summary className="cursor-pointer list-none px-3 py-2 text-sm text-slate-300 hover:text-white flex items-center gap-2">
            <Map className="h-4 w-4 text-emerald-400" />
            <span>Maps & Attribution</span>
            <span className="ml-auto text-slate-500 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-3 pb-3 text-xs text-slate-400 space-y-2">
            <p>
              <strong className="text-slate-300">Station Pages:</strong> Station location maps use an embedded OpenStreetMap view.
            </p>
            <p>
              <strong className="text-slate-300">Map Page Basemaps:</strong> SNOWD&apos;s avalanche map supports Carto Positron, Esri World Imagery, and OpenTopoMap basemaps with on-map attribution labels.
            </p>
            <p>
              <strong className="text-slate-300">Full Attribution:</strong> See the <Link href="/data" className="underline hover:text-slate-200">Data &amp; Attribution page</Link> for source links and methodology details.
            </p>
          </div>
        </details>
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center">
        Data refreshed from live sources. Forecast accuracy decreases beyond 3 days.{" "}
        <Link href="/data" className="underline hover:text-slate-300">
          Full source attribution & methodology
        </Link>
        .
      </p>
    </div>
  );
}
