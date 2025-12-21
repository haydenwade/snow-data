"use client";
import { Mountain, Compass, MapPin, Database, Layers, Hash } from "lucide-react";

type Station = {
  id: string | number;
  network: string;
  county: string;
  elevation: string;
  lat: number;
  lon: number;
  huc: string;
};

export default function StationMetadata({ station }: { station: Station }) {
  const items = [
    { icon: Hash, label: "Station ID", value: station.id },
    { icon: Database, label: "Network", value: station.network },
    { icon: MapPin, label: "County", value: station.county },
    { icon: Mountain, label: "Elevation", value: station.elevation },
    { icon: Compass, label: "Coordinates", value: `${station.lat}°N, ${Math.abs(station.lon)}°W` },
    { icon: Layers, label: "HUC", value: station.huc },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Database className="h-5 w-5 text-blue-400" />
        Station Metadata
      </h2>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-400">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
