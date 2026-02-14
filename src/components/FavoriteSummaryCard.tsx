"use client";

import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import FavoriteSummaryCardSkeleton from "./skeletons/FavoriteSummaryCardSkeleton";
import { Mountain } from "lucide-react";
import { MountainLocation } from "@/types/location";
import { SnowBuckets, formatDateYYYYMMDD } from "@/components/snow-report/utils";
import { ForecastDaily, Unit } from "@/types/forecast";

type FavoriteSummaryCardProps = {
  location: MountainLocation;
  buckets: SnowBuckets | null;
  forecast: ForecastDaily[];
  loading: boolean;
  error: string | null;
  unit: Unit;
};

export default function FavoriteSummaryCard({
  location,
  buckets,
  forecast,
  loading,
  error,
  unit,
}: FavoriteSummaryCardProps) {
  if (loading) return <FavoriteSummaryCardSkeleton />;

  const useMetric = unit === "mm";
  const formatSnow = (value: number) => {
    if (useMetric) return `${Math.round(value * 25.4)}`;
    return value.toFixed(1);
  };
  const unitLabel = useMetric ? "mm" : '"';

  // Next 7 individual days from forecast (today + 6 more)
  const next7Days = forecast.slice(0, 7);

  return (
    <Link
      href={`/location/${location.id}`}
      className="block bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 hover:bg-slate-700/40 transition-colors"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {location.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={location.logoUrl}
              alt={`${location.name} logo`}
              className="h-10 w-10 object-contain rounded-full shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-slate-700/40 flex items-center justify-center text-sm font-semibold text-slate-100 shrink-0">
              {String(location.name || "").split(" ")[0].charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white">{location.name}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Mountain className="h-3 w-3" />
              <span>
                {location.city}, {location.state}
              </span>
            </div>
          </div>
        </div>
        <FavoriteButton locationId={location.id} />
      </div>

      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : buckets ? (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {/* 1-7d ago */}
          <div className="flex-1 min-w-[90px] text-center rounded-lg py-1.5 px-1 bg-slate-700/20">
            <p className="text-[10px] font-medium text-slate-400 mb-0.5">1-7d ago</p>
            <p className="text-sm font-bold text-white">
              {formatSnow(buckets.prev1_7)}
              <span className="text-[9px] font-normal">{unitLabel}</span>
            </p>
          </div>

          {/* Last 24h */}
          <div className="flex-1 min-w-[90px] text-center rounded-lg py-1.5 px-1 bg-slate-700/60 border border-orange-500/40">
            <p className="text-[10px] font-medium text-orange-400 mb-0.5">Last 24h</p>
            <p className="text-sm font-bold text-orange-400">
              {formatSnow(buckets.last24)}
              <span className="text-[9px] font-normal">{unitLabel}</span>
            </p>
          </div>

          {/* Next 7 individual days */}
          {next7Days.map((day, i) => {
            const snow = day.snowIn;
            const hasSnow = snow > 0.05;
            return (
              <div
                key={day.date}
                className={`flex-1 min-w-[90px] text-center rounded-lg py-1.5 px-1 ${
                  i === 0
                    ? "bg-blue-500/15 border border-blue-500/30"
                    : "bg-slate-700/20"
                }`}
              >
                <p className="text-[10px] text-slate-400 mb-0.5">
                  {i === 0 ? "Today" : formatDateYYYYMMDD(day.date)}
                </p>
                <p
                  className={`text-sm font-bold ${
                    hasSnow ? "text-blue-400" : "text-slate-500"
                  }`}
                >
                  {formatSnow(snow)}
                  <span className="text-[9px] font-normal">{unitLabel}</span>
                </p>
              </div>
            );
          })}
        </div>
      ) : null}
    </Link>
  );
}
