"use client";
import { History } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { Unit, HistoricDay } from "./utils";

function fmtShort(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function HistoricChart({
  data,
  unit,
  loading,
}: {
  data: HistoricDay[];
  unit: Unit;
  loading?: boolean;
}) {
  const chartData = data.map((d) => ({
    ...d,
    displayDate: fmtShort(d.date),
    shortDate: new Date(`${d.date}T00:00:00Z`).toLocaleDateString("en-US", {
      day: "numeric",
      timeZone: "UTC",
    }),
    value: unit === "mm" ? d.derivedSnowfall! * 25.4 : d.derivedSnowfall,
    startDepthInches: d.snowDepthAtStartOfDay,
  }));

  const unitLabel = unit === "mm" ? "mm" : '"';
  const maxValue = Math.max(...chartData.map((d) => d.value!), 1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white">{item.displayDate}</p>
          <p className="text-lg font-bold text-orange-400">
            {item.value.toFixed(1)}
            {unitLabel}
          </p>
          {item.startDepthInches != null && (
            <p className="text-xs text-slate-400">
              Snow Depth:{" "}
              {unit === "mm"
                ? `${Math.round(item.startDepthInches * 25.4)} mm`
                : `${Math.round(item.startDepthInches)}"`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="h-6 w-40 bg-slate-700 mb-4 rounded animate-pulse" />
        <div className="h-64 w-full bg-slate-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
        <History className="h-5 w-5 text-orange-400" />
        <h2 className="font-semibold text-white">
          Past {data.length} Days Snowfall
        </h2>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 28, right: 10, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="shortDate"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#475569" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#475569" }}
              tickLine={false}
              tickFormatter={(v) => `${v}${unitLabel}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value! > 0 ? "#f97316" : "#475569"}
                  fillOpacity={0.8 + (entry.value! / maxValue) * 0.2}
                />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(v: number) => (v > 0 ? `${v}${unitLabel}` : "")}
                fill="#e2e8f0"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
