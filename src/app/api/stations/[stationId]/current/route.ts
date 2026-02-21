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
    // TODO: when is this a station triplet vs station id? Should station triplet be used instead?
    // Mammoth: MHP, others had number
    console.log("Fetching data for stationId:", stationId);
    const station = await resolveStation(stationId);

    if (!station) {
      return NextResponse.json(
        { error: "No station found matching stationId" },
        { status: 404 },
      );
    }

    // Determine if the station is a SNOTEL or COOP station
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
