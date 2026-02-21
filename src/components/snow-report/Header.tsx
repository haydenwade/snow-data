"use client";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const [mobileMenuOpenPath, setMobileMenuOpenPath] = useState<string | null>(
    null
  );
  const isMobileMenuOpen = mobileMenuOpenPath === currentPath;
  const segments = currentPath.split("/").filter(Boolean);
  const isHome = segments.length === 0;

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

          {!isHome && (
            <>
              <button
                type="button"
                aria-controls="mobile-nav"
                aria-expanded={isMobileMenuOpen}
                aria-label={
                  isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                className="sm:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:text-white transition"
                onClick={() =>
                  setMobileMenuOpenPath((openPath) =>
                    openPath === currentPath ? null : currentPath
                  )
                }
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              <nav className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
                <Link
                  href="/"
                  className="px-2 py-1 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
                >
                  Locations
                </Link>
              </nav>
            </>
          )}
        </div>

        {!isHome && isMobileMenuOpen && (
          <nav
            id="mobile-nav"
            className="sm:hidden mb-3 rounded-lg bg-slate-800/90 p-2 text-sm"
          >
            <Link
              href="/"
              className="block rounded-lg px-2 py-2 text-slate-100 hover:text-white transition"
              onClick={() => setMobileMenuOpenPath(null)}
            >
              Locations
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
