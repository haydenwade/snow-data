import Link from "next/link";
import { LOCATIONS } from "../components/snow-report/utils";

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
              <h2 className="text-xl font-semibold mb-2">{location.name}</h2>
              <div className="text-sm text-slate-400 space-y-1">
                <p>Network: {location.network}</p>
                <p>County: {location.county}</p>
                <p>Elevation: {location.elevation}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
