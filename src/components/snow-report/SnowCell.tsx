"use client";
import { Snowflake } from "lucide-react";
import type { Unit } from "./utils";

export default function SnowCell({ valueInInches, unit, tone }: { valueInInches: number; unit: Unit; tone: "historic" | "forecast" }) {
  const safeValue = valueInInches ?? 0;
  const isNonZero = safeValue > 0.05;
  const text = unit === "in" ? `${safeValue.toFixed(1)}"` : `${Math.round(safeValue * 25.4)} mm`;
  const color = isNonZero ? (tone === "historic" ? "text-orange-400" : "text-blue-400") : "text-slate-500";
  return (
    <div className={`w-full flex items-center justify-end gap-1 ${color}`}>
      {isNonZero && <Snowflake className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  );
}
