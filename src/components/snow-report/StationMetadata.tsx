"use client";
import {
  Mountain,
  Compass,
  MapPin,
  Database,
  Layers,
  Hash,
} from "lucide-react";
import { MountainLocation } from "@/types/location";

export default function StationMetadata({
  location,
  loading,
}: {
  location: MountainLocation;
  loading: boolean;
}) {
  if (loading) return null;
  const items = [
    { icon: Hash, label: "Station ID", value: location.stationId },
    { icon: Database, label: "Network", value: location.network },
    { icon: MapPin, label: "County", value: location.county },
    { icon: Mountain, label: "Elevation", value: location.elevation },
    {
      icon: Compass,
      label: "Coordinates",
      value: `${location.lat}°N, ${Math.abs(location.lon)}°W`,
    },
    { icon: Layers, label: "HUC", value: location.huc },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Database className="h-5 w-5 text-blue-400" />
        Station Metadata
      </h2>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0"
          >
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
