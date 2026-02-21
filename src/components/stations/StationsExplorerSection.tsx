"use client";

import StationsExplorerMap, {
  StationsMapViewport,
} from "@/components/stations/StationsExplorerMap";
import { GeoBounds, StationSummary } from "@/types/station";
import { Info } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type RequestedViewport = {
  stateCodes: string[];
  bounds: GeoBounds | null;
};

function parseStatesFromQuery(raw: string | null) {
  const parsed = (raw ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter((value) => /^[A-Z]{2}$/.test(value));
  return parsed.length > 0 ? Array.from(new Set(parsed)) : ["UT"];
}

function toBboxParam(bounds: GeoBounds | null) {
  if (!bounds) return null;
  return `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
}

async function fetchStations(
  viewport: RequestedViewport,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  params.set("states", viewport.stateCodes.join(","));
  const bbox = toBboxParam(viewport.bounds);
  if (bbox) params.set("bbox", bbox);

  const response = await fetch(`/api/stations?${params.toString()}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    let detail = "";
    try {
      const json = await response.json();
      detail = json?.error || JSON.stringify(json);
    } catch {
      // ignore parse error and use status only
    }
    throw new Error(
      `Stations fetch failed: ${response.status}${detail ? ` — ${detail}` : ""}`,
    );
  }

  const json = await response.json();
  return (json?.data ?? []) as StationSummary[];
}

export default function StationsExplorerSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialStates = useMemo(
    () => parseStatesFromQuery(searchParams.get("states")),
    [searchParams],
  );

  const [viewport, setViewport] = useState<RequestedViewport>({
    stateCodes: initialStates,
    bounds: null,
  });
  const [stations, setStations] = useState<StationSummary[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateKey = useMemo(
    () => viewport.stateCodes.join(","),
    [viewport.stateCodes],
  );
  const bboxKey = useMemo(
    () =>
      viewport.bounds
        ? `${viewport.bounds.west},${viewport.bounds.south},${viewport.bounds.east},${viewport.bounds.north}`
        : "none",
    [viewport.bounds],
  );

  useEffect(() => {
    const nextUrl = `${pathname}?states=${encodeURIComponent(stateKey)}`;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, stateKey]);

  useEffect(() => {
    if (!viewport.bounds) return;

    const abortController = new AbortController();
    const requestViewport: RequestedViewport = {
      stateCodes: viewport.stateCodes,
      bounds: viewport.bounds,
    };
    const timer = setTimeout(() => {
      setIsRefreshing(true);
      setError(null);

      fetchStations(requestViewport, abortController.signal)
        .then((data) => {
          setStations(data);
          setHasLoadedOnce(true);
        })
        .catch((err: unknown) => {
          if ((err as Error)?.name === "AbortError") return;
          setError((err as Error)?.message ?? "Failed to load stations");
          if (!hasLoadedOnce) setStations([]);
        })
        .finally(() => {
          if (!abortController.signal.aborted) {
            setIsRefreshing(false);
          }
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [bboxKey, hasLoadedOnce, stateKey, viewport.bounds, viewport.stateCodes]);

  const onViewportChange = useCallback((nextViewport: StationsMapViewport) => {
    setViewport((current) => {
      const nextStateKey = nextViewport.stateCodes.join(",");
      const currentStateKey = current.stateCodes.join(",");
      const nextBounds = nextViewport.bounds;
      const sameStateCodes = nextStateKey === currentStateKey;
      const sameBounds =
        current.bounds != null &&
        current.bounds.west === nextBounds.west &&
        current.bounds.south === nextBounds.south &&
        current.bounds.east === nextBounds.east &&
        current.bounds.north === nextBounds.north;
      if (sameStateCodes && sameBounds) return current;
      return {
        stateCodes: nextViewport.stateCodes.length
          ? nextViewport.stateCodes
          : current.stateCodes,
        bounds: nextBounds,
      };
    });
  }, []);

  return (
    <section id="stations" className="space-y-6 scroll-mt-20">
      <section className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Explore Weather Stations
          </h2>
          <div className="relative group self-center translate-y-0.5">
            <button
              type="button"
              aria-label="What is SNOTEL?"
              className="p-1 rounded-full hover:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Info className="h-4 w-4 text-slate-400" />
            </button>
            <div className="pointer-events-none absolute left-1/2 top-full mt-2 w-72 -translate-x-1/2 rounded-lg border border-slate-600 bg-slate-900/95 px-3 py-2 text-left text-xs text-slate-200 opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100 z-30">
              SNOTEL stations are mountain weather sensors. They measure snow,
              temperature, and rain so you can see what conditions are really
              like before you go.
            </div>
          </div>
        </div>
        <p className="text-slate-300 max-w-3xl mx-auto">
          Pan and zoom the map to find mountain weather stations across the
          West. Click a marker to see current snow depth, recent snowfall,
          forecast, and long-term history for that spot.
        </p>
      </section>

      {error ? <div className="text-xs text-red-400">{error}</div> : null}

      {!hasLoadedOnce && isRefreshing ? (
        <div className="text-xs text-slate-400">Loading stations...</div>
      ) : null}

      <StationsExplorerMap
        stations={stations}
        isRefreshing={isRefreshing}
        onViewportChange={onViewportChange}
      />
    </section>
  );
}
