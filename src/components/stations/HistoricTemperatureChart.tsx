"use client";

import { HistoricHourlyTemperaturePoint } from "@/types/historic";
import { Unit } from "@/types/forecast";
import { Thermometer } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { celsiusFromF } from "@/components/snow-report/utils";

function formatAxisLabel(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric" });
}

function formatTooltipLabel(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HistoricTemperatureChart({
  data,
  unit,
  loading,
}: {
  data: HistoricHourlyTemperaturePoint[];
  unit: Unit;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="h-6 w-44 rounded bg-slate-700/40 animate-pulse" />
        <div className="mt-4 h-64 rounded bg-slate-700/20 animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
          <Thermometer className="h-5 w-5 text-red-400" />
          <h2 className="font-semibold text-white">7-Day Hourly Temperature</h2>
        </div>
        <div className="text-sm text-slate-400">No hourly temperature data.</div>
      </div>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    xLabel: formatAxisLabel(point.timestamp),
  }));

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
        <Thermometer className="h-5 w-5 text-red-400" />
        <h2 className="font-semibold text-white">7-Day Hourly Temperature</h2>
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
              tickFormatter={(value) =>
                unit === "mm" ? `${celsiusFromF(value)}°` : `${value}°`
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const point = payload[0]?.payload as {
                  timestamp?: string;
                  temperatureF?: number | null;
                };
                const temperatureF = point.temperatureF;
                const valueText =
                  typeof temperatureF === "number"
                    ? unit === "mm"
                      ? `${celsiusFromF(temperatureF)}°C`
                      : `${Math.round(temperatureF)}°F`
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
              dataKey="temperatureF"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        Hourly temperature observations (past 7 days)
      </div>
    </div>
  );
}
