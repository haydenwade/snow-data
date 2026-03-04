"use client";
import { CloudSnow } from "lucide-react";
import ForecastChartSkeleton from "../skeletons/ForecastChartSkeleton";
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
import { ForecastDaily, Unit } from "@/types/forecast";
import {
  formatDateYYYYMMDD,
  formatMonthDay,
  formatWeekdayShort,
  inchesToCm,
} from "./utils";

export default function ForecastChart({
  data,
  unit,
  loading,
}: {
  data: ForecastDaily[];
  unit: Unit;
  loading?: boolean;
}) {
  const chartData = data.map((d) => ({
    ...d,
    displayDate: formatDateYYYYMMDD(d.date),
    shortDate: formatWeekdayShort(d.date),
    tickDOW: formatWeekdayShort(d.date),
    tickMD: formatMonthDay(d.date),
    value: unit === "mm" ? inchesToCm(d.snowIn) : d.snowIn,
  }));

  const unitLabel = unit === "mm" ? "cm" : '"';
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white">{item.displayDate}</p>
          <p className="text-lg font-bold text-blue-400">
            {item.value.toFixed(1)}
            {unitLabel}
          </p>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-slate-400">PoP: {item.pop}%</p>
            {unit === "mm" ? (
              item.tMaxC != null && item.tMinC != null ? (
                <p className="text-xs text-slate-400">
                  {item.tMaxC}°/{item.tMinC}°C
                </p>
              ) : null
            ) : item.tMaxF != null && item.tMinF != null ? (
              <p className="text-xs text-slate-400">
                {Math.round(item.tMaxF)}°/{Math.round(item.tMinF)}°F
              </p>
            ) : null}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading || data.length === 0) {
    return <ForecastChartSkeleton />;
  }

  const PopLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value == null) return null;
    const pop = Number(value);
    const fill = pop >= 70 ? "#93c5fd" : pop >= 40 ? "#60a5fa" : "#64748b";
    const textFill = pop >= 40 ? "#dbeafe" : "#94a3b8";
    const labelY = Math.min(y - 6, 12);
    return (
      <text
        x={x + width / 2}
        y={labelY}
        fill={textFill}
        fontSize={10}
        textAnchor="middle"
      >
        {pop}%
      </text>
    );
  };

  const DayTick = (props: any) => {
    const { x, y, payload } = props;
    const idx = payload?.index ?? 0;
    const row = chartData[idx] || {};
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={16} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          {row.tickDOW}
        </text>
        <text dy={30} textAnchor="middle" fill="#94a3b8" fontSize={10} opacity={0.85}>
          {row.tickMD}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <CloudSnow className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">7-Day Forecast</h2>
        </div>
      </div>
      <div className="h-100">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 28, right: 10, left: -10, bottom: 40 }}
          >
            <XAxis
              dataKey="tickDOW"
              tick={<DayTick />}
              axisLine={{ stroke: "#475569" }}
              tickLine={false}
              interval={0}
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
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
              <LabelList dataKey="pop" content={<PopLabel />} />
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value > 0 ? "#3b82f6" : "#475569"}
                  fillOpacity={0.7 + (entry.value / maxValue) * 0.3}
                />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(v: number) =>
                  v > 0 ? `${Math.round(v)}${unitLabel}` : ""
                }
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
