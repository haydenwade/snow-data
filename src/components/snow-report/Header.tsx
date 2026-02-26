"use client";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Home, Map as MapIcon, Menu, Settings, Share, Star, X } from "lucide-react";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { shareStation } from "@/lib/share-station";

export default function Header() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const [mobileMenuOpenPath, setMobileMenuOpenPath] = useState<string | null>(
    null,
  );
  const isMobileMenuOpen = mobileMenuOpenPath === currentPath;
  const segments = currentPath.split("/").filter(Boolean);
  const isStationPage = segments[0] === "stations" && segments.length >= 2;
  const handleShare = useCallback(async () => {
    await shareStation();
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="SNOWD home"
            className="flex items-center gap-2"
          >
            <Image
              src="/snowd-logo.png"
              alt="SNOWD"
              width={160}
              height={40}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <nav className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
              <Link
                href="/favorites"
                className="px-2 py-1 rounded-lg hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1"
              >
                <Star className="h-3.5 w-3.5" />
                Favorites
              </Link>
              <Link
                href="/"
                className="px-2 py-1 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Locations
              </Link>
              <Link
                href="/map"
                className="px-2 py-1 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Map
              </Link>
              <Link
                href="/knowledge"
                className="px-2 py-1 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Knowledge
              </Link>
              <Link
                href="/settings"
                aria-label="Settings"
                title="Settings"
                className="inline-flex items-center justify-center rounded-lg p-1.5 hover:text-white hover:bg-slate-800/60 transition"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </nav>

            <div className="sm:hidden flex items-center gap-1">
              {isStationPage && (
                <button
                  type="button"
                  aria-label="Share station"
                  title="Share station"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:text-white transition"
                >
                  <Share className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                aria-controls="mobile-nav"
                aria-expanded={isMobileMenuOpen}
                aria-label={
                  isMobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:text-white transition"
                onClick={() =>
                  setMobileMenuOpenPath((openPath) =>
                    openPath === currentPath ? null : currentPath,
                  )
                }
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            id="mobile-nav"
            className="sm:hidden mb-3 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-lg"
          >
            <Link
              href="/favorites"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              onClick={() => setMobileMenuOpenPath(null)}
            >
              <Star className="h-4 w-4" />
              Favorites
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              onClick={() => setMobileMenuOpenPath(null)}
            >
              <Home className="h-4 w-4" />
              Locations
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              onClick={() => setMobileMenuOpenPath(null)}
            >
              <MapIcon className="h-4 w-4" />
              Map
            </Link>
            <Link
              href="/knowledge"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              onClick={() => setMobileMenuOpenPath(null)}
            >
              <BookOpen className="h-4 w-4" />
              Knowledge
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              onClick={() => setMobileMenuOpenPath(null)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
