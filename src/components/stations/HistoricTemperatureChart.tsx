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
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50 animate-pulse">
          <div className="h-5 w-5 rounded bg-slate-700/40" />
          <div className="h-6 w-44 rounded bg-slate-700/40" />
        </div>
        <div className="h-72 rounded-xl border border-slate-700/40 bg-slate-900/20 p-3 animate-pulse">
          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-px w-full bg-slate-700/30" />
              ))}
            </div>
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <polyline
                  points="0,72 10,68 20,64 30,66 40,58 50,62 60,48 70,52 80,44 90,47 100,40"
                  fill="none"
                  stroke="rgba(248,113,113,0.65)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="0,72 10,68 20,64 30,66 40,58 50,62 60,48 70,52 80,44 90,47 100,40"
                  fill="none"
                  stroke="rgba(248,113,113,0.2)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-3 w-5 rounded bg-slate-700/35" />
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 w-6 rounded bg-slate-700/35" />
              ))}
            </div>
          </div>
        </div>
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
              stroke="#f97316"
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
