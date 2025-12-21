"use client";
import { Snowflake } from "lucide-react";
import type { Unit } from "./utils";

export default function SnowCell({ valueInInches, unit, tone }: { valueInInches: number; unit: Unit; tone: "historic" | "forecast" }) {
  const isNonZero = (valueInInches || 0) > 0.05;
  const text = unit === "in" ? `${valueInInches.toFixed(1)}"` : `${Math.round(valueInInches * 25.4)} mm`;
  const color = isNonZero ? (tone === "historic" ? "text-orange-400" : "text-blue-400") : "text-slate-500";
  return (
    <div className={`w-full flex items-center justify-end gap-1 ${color}`}>
      {isNonZero && <Snowflake className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  );
}
