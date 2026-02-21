"use client";

import Footer from "@/components/snow-report/Footer";
import StationsExplorerMap, {
  StationsMapViewport,
} from "@/components/stations/StationsExplorerMap";
import { GeoBounds, StationSummary } from "@/types/station";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function StationsPage() {
  const router = useRouter();
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
  const [query, setQuery] = useState("");

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
    const nextUrl = `/stations?states=${encodeURIComponent(stateKey)}`;
    router.replace(nextUrl, { scroll: false });
  }, [router, stateKey]);

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

  const filteredStations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter((station) => {
      const haystack = [
        station.name,
        station.stationId,
        station.stateCode,
        station.countyName,
        station.networkCode,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, stations]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6">
        <section className="space-y-3 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Explore SNOTEL Stations
          </h1>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Pan and zoom the map to browse station coverage quickly across the
            West. Click any marker to open station details.
          </p>

          <div className="max-w-xl mx-auto">
            <label htmlFor="station-search" className="sr-only">
              Search stations
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="station-search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by station name, ID, state, or county"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400 text-center">
              {query
                ? `${filteredStations.length} result${filteredStations.length === 1 ? "" : "s"}`
                : `${filteredStations.length} stations in viewport`}
            </p>
          </div>
        </section>

        {error ? <div className="text-xs text-red-400">{error}</div> : null}

        {!hasLoadedOnce && isRefreshing ? (
          <div className="text-xs text-slate-400">Loading stations...</div>
        ) : null}

        <StationsExplorerMap
          stations={filteredStations}
          isRefreshing={isRefreshing}
          onViewportChange={onViewportChange}
        />
        <Footer />
      </div>
    </div>
  );
}
