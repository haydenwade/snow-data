"use client";
import { MountainLocation } from "@/types/location";
import { MapPin } from "lucide-react";

export default function StationMap(props: {
  location: MountainLocation;
  loading: boolean;
}) {
  const { location, loading } = props;
  const lat = location.lat,
    lon = location.lon;
  const bbox = `${lon - 0.05},${lat - 0.03},${lon + 0.05},${lat + 0.03}`;
  const marker = `${lat},${lon}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(marker)}`;

  if (loading) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-orange-400" />
          <h2 className="font-semibold text-white">Station Location</h2>
        </div>
      </div>
      <iframe
        className="w-full flex-1 min-h-[16rem]"
        src={src}
        title="SNOTEL Map"
      />
    </div>
  );
}
