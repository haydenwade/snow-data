import {
  fetchStationByTriplet,
  findLocationByTriplet,
} from "@/lib/server/stations";
import { normalizeTripletInput } from "@/lib/station-triplet";
import { fetchSnotelCurrentConditions } from "@/lib/server/snotel-current";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ stationTriplet: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const stationTriplet = normalizeTripletInput(params.stationTriplet);
    if (!stationTriplet) {
      return NextResponse.json(
        { error: "Invalid station triplet format. Expected stationId:stateCode:networkCode" },
        { status: 400 },
      );
    }

    const station = await fetchStationByTriplet(stationTriplet);

    if (!station) {
      return NextResponse.json(
        { error: "No station found matching station triplet" },
        { status: 404 },
      );
    }

    // Determine if the station is a SNOTEL or COOP station
    const locationMatch = findLocationByTriplet(station.stationTriplet);

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
