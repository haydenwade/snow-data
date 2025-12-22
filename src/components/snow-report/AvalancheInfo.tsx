"use client";

import ResourceCard from "./ResourceCard";
import type { Location } from "./utils";
import { AlertTriangle } from "lucide-react";

export default function AvalancheInfo({ location }: { location: Location }) {
  const links = location.avalancheInfoLinks ?? [];
  if (links.length === 0) return null;

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h2 className="font-semibold text-white">Avalanche Info</h2>
        </div>
      </div>

      <div className="p-4 pt-3 space-y-2">
        {links.map((link) => (
          <ResourceCard key={link.url} link={link} />
        ))}
      </div>
    </div>
  );
}
