"use client";

import { MountainLocation } from "@/types/location";
import { StationAvalancheRegion } from "@/types/station";
import ResourceCard from "./ResourceCard";
import { AlertTriangle } from "lucide-react";

function formatDangerLabel(
  danger: string | null | undefined,
  dangerLevel: number | null | undefined,
) {
  const normalized = (danger ?? "").trim();
  if (normalized) {
    return normalized
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  if (dangerLevel === -1) return "No Rating";
  if (dangerLevel === 1) return "Low";
  if (dangerLevel === 2) return "Moderate";
  if (dangerLevel === 3) return "Considerable";
  if (dangerLevel === 4) return "High";
  if (dangerLevel === 5) return "Extreme";
  return "Unknown";
}

function formatDangerHeadline(region: StationAvalancheRegion) {
  const label = formatDangerLabel(region.danger, region.dangerLevel).toUpperCase();
  if (region.dangerLevel == null || region.dangerLevel < 0) return label;
  return `${region.dangerLevel} - ${label}`;
}

function formatValidityDateTime(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatValidityRange(region: StationAvalancheRegion) {
  const startLabel = formatValidityDateTime(region.startDate);
  const endLabel = formatValidityDateTime(region.endDate);
  if (!startLabel && !endLabel) return null;
  const tzSuffix = typeof region.timezone === "string" && region.timezone.trim()
    ? ` ${region.timezone.split("/").pop()?.replace(/_/g, " ") ?? region.timezone}`
    : "";
  return `Valid: ${startLabel ?? "Unknown"} - ${endLabel ?? "Unknown"}${tzSuffix}`;
}

export default function AvalancheInfo({
  location,
  loading,
  avalancheRegion,
}: {
  location: MountainLocation;
  loading: boolean;
  avalancheRegion?: StationAvalancheRegion | null;
}) {
  const links = location.avalancheInfoLinks ?? [];
  if (loading || (links.length === 0 && !avalancheRegion)) return null;

  const validityRange = avalancheRegion ? formatValidityRange(avalancheRegion) : null;
  const forecastUrl = avalancheRegion?.link ?? avalancheRegion?.centerLink ?? null;

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h2 className="font-semibold text-white">Avalanche Info</h2>
        </div>
      </div>

      <div className="p-4 pt-3 space-y-2">
        {avalancheRegion ? (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Current Danger
              </span>
              <span
                className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-extrabold tracking-wide"
                style={{
                  backgroundColor: avalancheRegion.color ?? "#1f2937",
                  borderColor: avalancheRegion.stroke ?? "#475569",
                  color: avalancheRegion.fontColor ?? "#ffffff",
                }}
              >
                {formatDangerHeadline(avalancheRegion)}
              </span>
            </div>

            {avalancheRegion.warningInEffect ? (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-red-400/40 bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Avalanche Warning in Effect
              </div>
            ) : null}

            <div className="mt-3 text-sm font-semibold text-white">
              {avalancheRegion.name ?? "Avalanche Region"}
            </div>
            <div className="mt-1 text-xs text-slate-300">
              {avalancheRegion.center ?? "Avalanche Center"}
              {avalancheRegion.state ? ` · ${avalancheRegion.state}` : ""}
            </div>
            {validityRange ? (
              <div className="mt-1 text-xs italic text-slate-400">{validityRange}</div>
            ) : null}

            {forecastUrl ? (
              <a
                href={forecastUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700/40"
              >
                {avalancheRegion.link ? "View forecast ↗" : "Open avalanche center ↗"}
              </a>
            ) : null}
          </div>
        ) : null}

        {links.map((link) => (
          <ResourceCard key={link.url} link={link} />
        ))}
      </div>
    </div>
  );
}
