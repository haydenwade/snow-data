import {
  fetchStationsByStateCodes,
  findLocationByTriplet,
  normalizeStateCodes,
  toStationSummary,
} from "@/lib/server/stations";
import { GeoBounds } from "@/types/station";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseStates(searchParams: URLSearchParams) {
  const fromStates = normalizeStateCodes(searchParams.get("states"));
  const fromState = normalizeStateCodes(searchParams.get("state"));
  const fromMulti = searchParams
    .getAll("states")
    .flatMap((value) => normalizeStateCodes(value));
  const all = Array.from(new Set([...fromStates, ...fromState, ...fromMulti]));
  return all.length > 0 ? all : ["UT"];
}

function parseBbox(raw: string | null): GeoBounds | null {
  if (!raw) return null;
  const parts = raw.split(",").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) {
    return null;
  }
  const [west, south, east, north] = parts;
  if (south > north) return null;
  return { west, south, east, north };
}

function inBbox(
  lat: number,
  lon: number,
  bbox: GeoBounds,
) {
  const latInRange = lat >= bbox.south && lat <= bbox.north;
  const lonInRange =
    bbox.west <= bbox.east
      ? lon >= bbox.west && lon <= bbox.east
      : lon >= bbox.west || lon <= bbox.east;
  return latInRange && lonInRange;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const states = parseStates(searchParams);
    const bbox = parseBbox(searchParams.get("bbox"));
    const stations = await fetchStationsByStateCodes(states);

    const inScope = bbox
      ? stations.filter((station) =>
          inBbox(
            station.latitude ?? 0,
            station.longitude ?? 0,
            bbox,
          ),
        )
      : stations;

    const data = inScope
      .map((station) => {
        const locationMatch = findLocationByTriplet(station.stationTriplet);
        return toStationSummary(station, locationMatch);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(
      {
        states,
        bbox,
        totalInStates: stations.length,
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch stations" },
      { status: 500 },
    );
  }
}
