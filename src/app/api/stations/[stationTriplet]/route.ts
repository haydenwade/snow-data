import {
  fetchStationByTriplet,
  findLocationByTriplet,
  resolveTripletFromStationKey,
  toMountainLocation,
  toStationSummary,
} from "@/lib/server/stations";
import { StationDetailResponse } from "@/types/station";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ stationTriplet: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<{ error?: string } | StationDetailResponse>> {
  try {
    const params = await context.params;
    const stationTriplet = resolveTripletFromStationKey(params.stationTriplet);
    if (!stationTriplet) {
      return NextResponse.json(
        { error: "Invalid station identifier format" },
        { status: 400 },
      );
    }

    const station = await fetchStationByTriplet(stationTriplet);

    if (!station) {
      return NextResponse.json(
        { error: "No station found matching station identifier" },
        { status: 404 },
      );
    }

    const locationMatch = findLocationByTriplet(station.stationTriplet);

    const response: StationDetailResponse = {
      station: toStationSummary(station, locationMatch),
      location: toMountainLocation(station, locationMatch),
      locationMatch,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch station" },
      { status: 500 },
    );
  }
}
