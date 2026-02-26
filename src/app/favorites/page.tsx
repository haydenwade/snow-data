"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { LOCATIONS } from "@/constants/locations";
import { fetchHistoric, fetchForecastGrid, fetchStationDetail } from "@/lib/api";
import {
  aggregateForecastToDaily,
  computeSnowBuckets,
  SnowBuckets,
} from "@/components/snow-report/utils";
import FavoriteSummaryCard from "@/components/FavoriteSummaryCard";
import Footer from "@/components/snow-report/Footer";
import { useUserSettings } from "@/hooks/useUserSettings";
import { ForecastDaily } from "@/types/forecast";
import { MountainLocation } from "@/types/location";

type LocationData = {
  buckets: SnowBuckets | null;
  forecast: ForecastDaily[];
  loading: boolean;
  error: string | null;
};

type FavoriteLocationEntry = {
  favoriteId: string;
  location: MountainLocation;
};

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { unit } = useUserSettings();
  const [data, setData] = useState<Record<string, LocationData>>({});
  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocationEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    if (!favorites.length) {
      setFavoriteLocations([]);
      return;
    }

    const loadFavoriteLocations = async () => {
      const results = await Promise.all(
        favorites.map(async (favoriteId) => {
          const curatedLocation = LOCATIONS.find((location) => location.id === favoriteId);
          if (curatedLocation) {
            return { favoriteId, location: curatedLocation } as FavoriteLocationEntry;
          }

          try {
            const detail = await fetchStationDetail(favoriteId);
            return { favoriteId, location: detail.location } as FavoriteLocationEntry;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      setFavoriteLocations(
        results.filter(
          (entry): entry is FavoriteLocationEntry => entry !== null
        )
      );
    };

    void loadFavoriteLocations();

    return () => {
      cancelled = true;
    };
  }, [favorites]);

  useEffect(() => {
    if (!favoriteLocations.length) return;

    // Initialize loading state for all favorites
    setData((prev) => {
      const next = { ...prev };
      for (const { favoriteId } of favoriteLocations) {
        if (!next[favoriteId]) {
          next[favoriteId] = { buckets: null, forecast: [], loading: true, error: null };
        }
      }
      return next;
    });

    // Fetch data for each location in parallel
    for (const { favoriteId, location } of favoriteLocations) {
      (async () => {
        try {
          setData((prev) => ({
            ...prev,
            [favoriteId]: { buckets: null, forecast: [], loading: true, error: null },
          }));

          const [historic, grid] = await Promise.all([
            fetchHistoric(favoriteId, 30),
            fetchForecastGrid(location.lat, location.lon),
          ]);
          const forecast = aggregateForecastToDaily(grid, location.timezone);
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
            [favoriteId]: {
              buckets,
              forecast: todayAndFuture,
              loading: false,
              error: null,
            },
          }));
        } catch (e) {
          setData((prev) => ({
            ...prev,
            [favoriteId]: {
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
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-28">
          <div className="text-center">
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
          <Footer />
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
        </div>

        <div className="flex flex-col gap-4">
          {favoriteLocations.map(({ favoriteId, location }) => {
            const d = data[favoriteId] ?? {
              buckets: null,
              forecast: [],
              loading: true,
              error: null,
            };
            return (
              <FavoriteSummaryCard
                key={favoriteId}
                favoriteId={favoriteId}
                location={location}
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
