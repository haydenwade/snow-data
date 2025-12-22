"use client";
import type { Location } from "./utils";
import { Instagram, Link, Mountain } from "lucide-react";
import ResourceCard from "./ResourceCard";
import { SiX } from "react-icons/si";

function getSocialIcon(url: string) {
  if (/twitter\.com/.test(url)) return <SiX className="h-5 w-5" />;
  if (/x\.com/.test(url)) return <SiX className="h-5 w-5" />;
  if (/instagram\.com/.test(url)) return <Instagram className="h-5 w-5" />;
  return <Link className="h-5 w-5" />;
}

export default function ResortInfoLinks({ location, loading }: { location: Location, loading: boolean }) {
  const links = location.resortInfoLinks ?? [];
  if (loading || links.length === 0) return null;

  // Deduplicate by URL (prevents repeated “Parking” etc.)
  const sorted = Array.from(new Map(links.map((l) => [l.url, l])).values());

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden w-full">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-blue-400" />
            <h2 className="font-semibold text-white">Resort Info</h2>
          </div>
          {location.socialMediaLinks &&
            location.socialMediaLinks.length > 0 && (
              <div className="flex items-center gap-2">
                {location.socialMediaLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition"
                    aria-label={link.label}
                  >
                    {getSocialIcon(link.url)}
                  </a>
                ))}
              </div>
            )}
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
