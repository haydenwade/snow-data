import { LOCATIONS } from "@/constants/locations";
import {
  fetchStationByTriplet,
  toMountainLocation,
} from "@/lib/server/stations";
import { MountainLocation } from "@/types/location";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const resolved = await Promise.all(
      LOCATIONS.map(async (curatedLocation) => {
        try {
          const station = await fetchStationByTriplet(curatedLocation.stationTriplet);
          if (!station) return null;
          return toMountainLocation(station, curatedLocation);
        } catch {
          return null;
        }
      }),
    );

    const data = resolved.filter(
      (location): location is MountainLocation => location !== null,
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch curated stations" },
      { status: 500 },
    );
  }
}
