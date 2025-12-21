"use client";

export default function StationMap() {
  const lat = 40.59, lon = -111.64;
  const bbox = `${lon-0.05},${lat-0.03},${lon+0.05},${lat+0.03}`;
  const marker = `${lat},${lon}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="text-sm font-semibold text-white">Alta, Utah — SNOTEL 1308</div>
        <div className="text-xs text-slate-400">Lat 40.59, Lon -111.64 • Elev 8,750 ft</div>
      </div>
      <iframe className="w-full h-56" src={src} title="Alta SNOTEL Map" />
    </div>
  );
}
