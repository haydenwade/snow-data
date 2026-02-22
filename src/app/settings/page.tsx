"use client";

import { useCallback } from "react";
import { Ruler, Settings, Star, Trash2 } from "lucide-react";
import Footer from "@/components/snow-report/Footer";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserSettings } from "@/hooks/useUserSettings";

export default function SettingsPage() {
  const { unit, setUnit } = useUserSettings();
  const { favorites, clearFavorites } = useFavorites();

  const handleClearFavorites = useCallback(() => {
    if (!favorites.length) return;

    const confirmed = window.confirm(
      `Remove all ${favorites.length} favorite${favorites.length === 1 ? "" : "s"}?`
    );

    if (!confirmed) return;
    clearFavorites();
  }, [clearFavorites, favorites.length]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-28">
        <div className="mb-6 flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50">
            <Settings className="h-5 w-5 text-slate-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-slate-400">
              Manage app-wide preferences for snow reports and favorites.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/40 text-slate-200">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Unit of Measure</h2>
                <p className="text-sm text-slate-400">
                  Applies across all pages that show snow, temperature, and wind values.
                </p>
              </div>
            </div>

            <div className="inline-flex rounded-xl overflow-hidden border border-slate-700/50">
              <button
                type="button"
                onClick={() => setUnit("in")}
                className={`px-4 py-2 text-sm transition-colors ${
                  unit === "in"
                    ? "bg-slate-700/70 text-white"
                    : "bg-slate-800/60 text-slate-300"
                }`}
                aria-pressed={unit === "in"}
              >
                Imperial
              </button>
              <button
                type="button"
                onClick={() => setUnit("mm")}
                className={`px-4 py-2 text-sm transition-colors ${
                  unit === "mm"
                    ? "bg-slate-700/70 text-white"
                    : "bg-slate-800/60 text-slate-300"
                }`}
                aria-pressed={unit === "mm"}
              >
                Metric
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-red-500/20 bg-red-950/20 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-300">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Favorites</h2>
                <p className="text-sm text-slate-400">
                  Remove all saved favorites from this device.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-300">
                {favorites.length} favorite{favorites.length === 1 ? "" : "s"} saved
              </div>
              <button
                type="button"
                onClick={handleClearFavorites}
                disabled={!favorites.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove All Favorites
              </button>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
}
