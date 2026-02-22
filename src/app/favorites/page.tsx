"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { LOCATIONS } from "@/constants/locations";
import { fetchHistoric, fetchForecastGrid } from "@/lib/api";
import {
  aggregateForecastToDaily,
  computeSnowBuckets,
  SnowBuckets,
} from "@/components/snow-report/utils";
import FavoriteSummaryCard from "@/components/FavoriteSummaryCard";
import Footer from "@/components/snow-report/Footer";
import { ForecastDaily, Unit } from "@/types/forecast";

type LocationData = {
  buckets: SnowBuckets | null;
  forecast: ForecastDaily[];
  loading: boolean;
  error: string | null;
};

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [unit, setUnit] = useState<Unit>("in");
  const [data, setData] = useState<Record<string, LocationData>>({});

  const favoriteLocations = useMemo(
    () =>
      favorites
        .map((id) => LOCATIONS.find((l) => l.id === id))
        .filter(Boolean) as (typeof LOCATIONS)[number][],
    [favorites]
  );

  useEffect(() => {
    if (!favoriteLocations.length) return;

    // Initialize loading state for all favorites
    setData((prev) => {
      const next = { ...prev };
      for (const loc of favoriteLocations) {
        if (!next[loc.id]) {
          next[loc.id] = { buckets: null, forecast: [], loading: true, error: null };
        }
      }
      return next;
    });

    // Fetch data for each location in parallel
    for (const loc of favoriteLocations) {
      (async () => {
        try {
          setData((prev) => ({
            ...prev,
            [loc.id]: { buckets: null, forecast: [], loading: true, error: null },
          }));

          const [historic, grid] = await Promise.all([
            fetchHistoric(loc.id, 30),
            fetchForecastGrid(loc.lat, loc.lon),
          ]);
          const forecast = aggregateForecastToDaily(grid, loc.timezone);
          const todayAndFuture = forecast.filter((d) => {
            const today = new Date();
            const dDate = new Date(`${d.date}T00:00:00`);
            return (
              dDate >=
              new Date(today.getFullYear(), today.getMonth(), today.getDate())
            );
          });
          const buckets = computeSnowBuckets(historic, todayAndFuture);

          setData((prev) => ({
            ...prev,
            [loc.id]: { buckets, forecast: todayAndFuture, loading: false, error: null },
          }));
        } catch (e) {
          setData((prev) => ({
            ...prev,
            [loc.id]: {
              buckets: null,
              forecast: [],
              loading: false,
              error: (e as Error)?.message || "Failed to load",
            },
          }));
        }
      })();
    }
  }, [favoriteLocations]);

  if (!favorites.length) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <Star className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No favorites yet</h1>
          <p className="text-slate-400 mb-6">
            Star locations to see them here for quick comparison.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition text-sm"
          >
            Browse Locations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-28">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            Favorites
          </h1>
          <div className="inline-flex rounded-xl overflow-hidden border border-slate-700/50">
            <button
              onClick={() => setUnit("in")}
              className={`px-4 py-2 text-sm transition-colors ${
                unit === "in"
                  ? "bg-slate-700/70 text-white"
                  : "bg-slate-800/60 text-slate-300"
              }`}
            >
              Imperial
            </button>
            <button
              onClick={() => setUnit("mm")}
              className={`px-4 py-2 text-sm transition-colors ${
                unit === "mm"
                  ? "bg-slate-700/70 text-white"
                  : "bg-slate-800/60 text-slate-300"
              }`}
            >
              Metric
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {favoriteLocations.map((loc) => {
            const d = data[loc.id] ?? {
              buckets: null,
              forecast: [],
              loading: true,
              error: null,
            };
            return (
              <FavoriteSummaryCard
                key={loc.id}
                location={loc}
                buckets={d.buckets}
                forecast={d.forecast}
                loading={d.loading}
                error={d.error}
                unit={unit}
              />
            );
          })}
        </div>
        <Footer />
      </div>
    </div>
  );
}
