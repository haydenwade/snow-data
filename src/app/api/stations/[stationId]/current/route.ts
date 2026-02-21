import {
  findLocationByStationId,
  findLocationByTriplet,
  resolveStation,
} from "@/lib/server/stations";
import { fetchSnotelCurrentConditions } from "@/lib/server/snotel-current";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ stationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

    const payload = await fetchSnotelCurrentConditions({
      station,
      locationMatch,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          (error as Error)?.message ||
          "Failed to fetch SNOTEL current conditions",
      },
      { status: 500 },
    );
  }
}
