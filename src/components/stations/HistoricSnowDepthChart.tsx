"use client";

import { HistoricHourlySnowDepthPoint } from "@/types/historic";
import { Unit } from "@/types/forecast";
import { Snowflake } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { inchesToCm, medianSmooth } from "@/components/snow-report/utils";
import { formatAxisLabel, formatTooltipLabel } from "./HistoricTemperatureChart";

/**
 * Hourly snow depth for the past 7 days. Renders nothing while loading, or
 * when the station has no depth sensor or no snow on the ground all week.
 */
export default function HistoricSnowDepthChart({
  data,
  unit,
  loading,
}: {
  data: HistoricHourlySnowDepthPoint[];
  unit: Unit;
  loading?: boolean;
}) {
  if (loading) return null;
  if (!data.some((point) => (point.snowDepthIn ?? 0) > 0)) return null;

  const smoothed = medianSmooth(data.map((point) => point.snowDepthIn));
  const chartData = data.map((point, i) => {
    const inches = smoothed[i];
    return {
      timestamp: point.timestamp,
      xLabel: formatAxisLabel(point.timestamp),
      depth: inches == null ? null : unit === "mm" ? inchesToCm(inches) : inches,
    };
  });
  const suffix = unit === "mm" ? " cm" : '"';

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
        <Snowflake className="h-5 w-5 text-orange-400" />
        <h2 className="font-semibold text-white">7-Day Hourly Snow Depth</h2>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 10, left: 12, bottom: 0 }}>
            <XAxis
              dataKey="xLabel"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#475569" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              width={42}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#475569" }}
              tickLine={false}
              allowDecimals={false}
              // Pad around the data instead of starting at 0 so a few inches
              // of new snow on a deep snowpack still shows as a visible climb.
              domain={[
                (min: number) => Math.max(0, Math.floor(min - 2)),
                (max: number) => Math.ceil(max + 2),
              ]}
              tickFormatter={(value) => `${value}${suffix}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const point = payload[0]?.payload as {
                  timestamp?: string;
                  depth?: number | null;
                };
                const valueText =
                  typeof point.depth === "number"
                    ? `${Math.round(point.depth)}${suffix}`
                    : "—";

                return (
                  <div className="rounded-xl border border-slate-700/70 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 shadow-lg">
                    <div className="text-slate-300">
                      {point.timestamp ? formatTooltipLabel(point.timestamp) : "Unknown"}
                    </div>
                    <div className="font-semibold text-white">{valueText}</div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="depth"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        Hourly snow depth observations (past 7 days), lightly smoothed to remove
        sensor noise. A steep climb means snow is accumulating quickly; a slow
        drop after a storm is normal settling.
      </div>
    </div>
  );
}
