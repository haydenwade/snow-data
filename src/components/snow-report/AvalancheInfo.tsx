"use client";

import { StationAvalancheRegion, StationNearbyAvalancheRegion } from "@/types/station";
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

function getDangerIconSrc(dangerLevel: number | null | undefined) {
  if (dangerLevel != null && dangerLevel >= 1 && dangerLevel <= 5) {
    return `/danger-icons/${dangerLevel}.png`;
  }
  return "/danger-icons/0.png";
}

export default function AvalancheInfo({
  loading,
  avalancheRegion,
  nearbyAvalancheRegions,
}: {
  loading: boolean;
  avalancheRegion?: StationAvalancheRegion | null;
  nearbyAvalancheRegions?: StationNearbyAvalancheRegion[];
}) {
  const nearbyRegions = nearbyAvalancheRegions ?? [];
  if (loading || (!avalancheRegion && nearbyRegions.length === 0)) {
    return null;
  }

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

      <div className="p-4 pt-3">
        {avalancheRegion ? (
          <div className="space-y-3">
            <div className="relative pr-24 sm:pr-28">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Current Danger
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                {avalancheRegion.name ?? "Avalanche Region"}
              </div>
              <div className="mt-1 text-xs text-slate-300">
                {avalancheRegion.center ?? "Avalanche Center"}
                {avalancheRegion.state ? ` · ${avalancheRegion.state}` : ""}
              </div>
              <div className="absolute right-0 top-0 flex h-14 w-[4.5rem] items-center justify-center overflow-hidden rounded-md border border-slate-600/70 bg-white/90 sm:h-16 sm:w-20">
                <img
                  src={getDangerIconSrc(avalancheRegion.dangerLevel)}
                  alt=""
                  aria-hidden="true"
                  className="max-h-full max-w-full object-contain p-1"
                  draggable={false}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
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

                {avalancheRegion.warningInEffect ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-red-400/40 bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Avalanche Warning in Effect
                  </span>
                ) : null}
              </div>

              {validityRange ? (
                <div className="mt-2 text-xs italic text-slate-400">{validityRange}</div>
              ) : null}
            </div>

            {forecastUrl ? (
              <a
                href={forecastUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700/40"
              >
                {avalancheRegion.link ? "View forecast ↗" : "Open avalanche center ↗"}
              </a>
            ) : null}
          </div>
        ) : null}

        {!avalancheRegion && nearbyRegions.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Nearby avalanche regions (within 50 miles)
            </div>
            <p className="mt-1 text-xs text-slate-400">
              This station is not inside an official avalanche forecast area. Nearest forecast regions:
            </p>

            <div className="divide-y divide-slate-700/40 border-t border-slate-700/40">
              {nearbyRegions.map((region) => {
                const nearbyForecastUrl = region.link ?? region.centerLink ?? null;
                const nearbyValidityRange = formatValidityRange(region);

                return (
                  <div
                    key={`${region.id}-${region.distanceMiles}`}
                    className="relative py-3 first:pt-3 last:pb-0 pr-20 sm:pr-24"
                  >
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <div className="text-sm font-semibold text-white">
                        {region.name ?? "Avalanche Region"}
                      </div>
                      <span className="text-xs text-slate-400">
                        {region.distanceMiles.toFixed(1)} mi away
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-300">
                      {region.center ?? "Avalanche Center"}
                      {region.state ? ` · ${region.state}` : ""}
                    </div>
                    <div className="absolute right-0 top-3 flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border border-slate-600/70 bg-white/90 sm:h-14 sm:w-[4.5rem]">
                      <img
                        src={getDangerIconSrc(region.dangerLevel)}
                        alt=""
                        aria-hidden="true"
                        className="max-h-full max-w-full object-contain p-1"
                        draggable={false}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-extrabold tracking-wide"
                        style={{
                          backgroundColor: region.color ?? "#1f2937",
                          borderColor: region.stroke ?? "#475569",
                          color: region.fontColor ?? "#ffffff",
                        }}
                      >
                        {formatDangerHeadline(region)}
                      </span>

                      {region.warningInEffect ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-red-400/40 bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">
                          <AlertTriangle className="h-3 w-3" />
                          Warning in Effect
                        </span>
                      ) : null}
                    </div>

                    {nearbyValidityRange ? (
                      <div className="mt-2 text-xs italic text-slate-400">
                        {nearbyValidityRange}
                      </div>
                    ) : null}

                    {nearbyForecastUrl ? (
                      <a
                        href={nearbyForecastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700/40"
                      >
                        {region.link ? "View nearby forecast ↗" : "Open avalanche center ↗"}
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
