import {
  findLocationByStationId,
  findLocationByTriplet,
  resolveStation,
  toMountainLocation,
  toStationSummary,
} from "@/lib/server/stations";
import { StationDetailResponse } from "@/types/station";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ stationId: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<{ error?: string } | StationDetailResponse>> {
  try {
    const params = await context.params;
    const stationId = params.stationId;
    const station = await resolveStation(stationId);

    if (!station) {
      return NextResponse.json(
        { error: "No station found matching stationId" },
        { status: 404 },
      );
    }

    const locationMatch =
      findLocationByTriplet(station.stationTriplet) ??
      findLocationByStationId(station.stationId);

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
