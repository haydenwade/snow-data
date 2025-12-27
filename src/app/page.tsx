import Link from "next/link";
import Footer from "@/components/snow-report/Footer";
import { LOCATIONS } from "@/constants/locations";
import { Mountain } from "lucide-react";
import RotatingFeatures from "@/components/RotatingFeatures";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-28">
        {/* Hero */}
        <div className="text-center mb-6">
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
          Select a location to see current conditions and snowfall.
        </h2>
        <div
          id="locations"
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0"
        >
          {LOCATIONS.map((location) => (
            <Link
              key={location.id}
              href={`/location/${location.id}`}
              className="block w-full min-w-0 p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-600"
            >
              <div className="flex items-center gap-4 mb-3">
                {location.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={location.logoUrl}
                    alt={`${location.name} logo`}
                    className="h-12 w-12 object-contain rounded-full flex-shrink-0 overflow-hidden"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-slate-700/40 flex items-center justify-center text-lg font-semibold text-slate-100 flex-shrink-0 overflow-hidden">
                    {String(location.name || "")
                      .split(" ")[0]
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
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
              <div className="text-sm text-slate-400 space-y-1 break-words">
                <p className="truncate">County: {location.county}</p>
                <p className="truncate">Elevation: {location.elevation}</p>
              </div>
            </Link>
          ))}
        </div>
        <Footer textOverride={"Don't see the location you are looking for?"} />
      </div>
    </div>
  );
}
