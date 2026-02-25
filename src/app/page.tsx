"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/components/snow-report/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import { LOCATIONS } from "@/constants/locations";
import { Mountain, Search } from "lucide-react";
import RotatingFeatures from "@/components/RotatingFeatures";
import StationsExplorerSection from "@/components/stations/StationsExplorerSection";
import AvalanchePsa from "@/components/AvalanchePsa";

export default function Home() {
  const [query, setQuery] = useState("");

  const visibleLocations = useMemo(
    () => LOCATIONS.filter((l) => !l.isHidden),
    []
  );

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleLocations;

    // Special case: show hidden emigrantsummit if user searches exactly "emigrant"
    const searchPool =
      q === "emigrant" ? LOCATIONS : visibleLocations;

    return searchPool.filter((l) => {
      const haystack = [
        l.name,
        l.city,
        l.state,
        l.county,
        l.elevation,
        l.network,
        l.id,
        l.stationId,
        l.stationTriplet,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, visibleLocations]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-28">
        {/* Hero */}
        <div className="text-center mb-6">
          <AvalanchePsa />

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Get the Snow Truth
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            SNOWD is the tool locals and backcountry users trust — and trip
            planners use to get stoked without being misled.
          </p>
          <RotatingFeatures />
        </div>

        {/* Locations grid */}
        <h2 className="text-center text-slate-200 text-lg md:text-xl font-semibold mb-4">
          See current conditions and snowfall at popular locations.
        </h2>
        {/* Search */}
        <div className="max-w-xl mx-auto mb-6">
          <label htmlFor="location-search" className="sr-only">
            Search locations
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="location-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city, or state"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
          {query.trim() ? (
            <p className="mt-2 text-xs text-slate-400">
              {filteredLocations.length} location
              {filteredLocations.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        <div
          id="locations"
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0"
        >
          {filteredLocations.map((location) => (
            <Link
              key={location.id}
              href={`/stations/${encodeURIComponent(location.id)}`}
              className="relative block w-full min-w-0 p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-600"
            >
              <FavoriteButton
                locationId={location.id}
                className="absolute top-2 right-2 z-10"
              />
              <div className="flex items-center gap-4 mb-3">
                {location.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={location.logoUrl}
                    alt={`${location.name} logo`}
                    className="h-12 w-12 object-contain rounded-full shrink-0 overflow-hidden"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-slate-700/40 flex items-center justify-center text-lg font-semibold text-slate-100 shrink-0 overflow-hidden">
                    {String(location.name || "")
                      .split(" ")[0]
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 pr-1">
                  <h2 className="text-xl font-semibold truncate">
                    {location.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <Mountain className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {location.city}, {location.state}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-400 space-y-1 wrap-break-word">
                <p className="truncate">County: {location.county}</p>
                <p className="truncate">Elevation: {location.elevation}</p>
              </div>
            </Link>
          ))}
          {filteredLocations.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-8">
              No locations match your search.
            </div>
          )}
        </div>
        <div className="mt-12">
          <Suspense fallback={null}>
            <StationsExplorerSection />
          </Suspense>
        </div>
        <Footer textOverride={"Don't see the location you are looking for?"} />
      </div>
    </div>
  );
}
