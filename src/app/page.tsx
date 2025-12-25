import Link from "next/link";
import Footer from "@/components/snow-report/Footer";
import { LOCATIONS } from "@/constants/locations";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Snow Data Reports</h1>
        <p className="text-xl text-center text-slate-300 mb-12">
          Select a location to view snow conditions, historic data, and forecasts.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((location) => (
            <Link
              key={location.id}
              href={`/location/${location.id}`}
              className="block p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-600"
            >
              <div className="flex items-center gap-4 mb-3">
                {location.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={location.logoUrl} alt={`${location.name} logo`} className="h-12 w-12 object-contain rounded-full flex-shrink-0 overflow-hidden" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-slate-700/40 flex items-center justify-center text-lg font-semibold text-slate-100 flex-shrink-0 overflow-hidden">
                    {String(location.name || "").split(" ")[0].charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-xl font-semibold">{location.name}</h2>
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                <p>Network: {location.network}</p>
                <p>County: {location.county}</p>
                <p>Elevation: {location.elevation}</p>
              </div>
            </Link>
          ))}
        </div>
        <Footer textOverride={"Don't see the location you are looking for?"}/>
      </div>
    </div>
  );
}
