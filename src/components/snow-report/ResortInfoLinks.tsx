"use client";
import type { Location } from "./utils";
import { Mountain } from "lucide-react";
import ResourceCard from "./ResourceCard";

export default function ResortInfoLinks({ location }: { location: Location }) {
  const links = location.resortInfoLinks ?? [];
  if (links.length === 0) return null;

  // Deduplicate by URL (prevents repeated “Parking” etc.)
  const sorted = Array.from(new Map(links.map((l) => [l.url, l])).values());

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden w-full">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Mountain className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-white">Resort Info</h2>
        </div>
      </div>

      <div className="p-4 pt-3 space-y-2 w-full">
        {sorted.map((link) => (
          <ResourceCard key={link.url} link={link} />
        ))}
      </div>
    </div>
  );
}
