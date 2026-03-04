import {
  findAvalancheRegionForPoint,
  findNearbyAvalancheRegionsForPoint,
} from "@/lib/server/avalanche-map-layer";
import {
  fetchStationByTriplet,
  findLocationByTriplet,
  resolveTripletFromStationKey,
  toMountainLocation,
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
    const enrichedStation = toMountainLocation(station, locationMatch);

    let avalancheRegion = null;
    let nearbyAvalancheRegions = [] as NonNullable<
      StationDetailResponse["nearbyAvalancheRegions"]
    >;
    try {
      avalancheRegion = await findAvalancheRegionForPoint(
        enrichedStation.latitude,
        enrichedStation.longitude,
      );
      if (!avalancheRegion) {
        nearbyAvalancheRegions = await findNearbyAvalancheRegionsForPoint(
          enrichedStation.latitude,
          enrichedStation.longitude,
          {
            maxDistanceMiles: 50,
            limit: 3,
          },
        );
      }
    } catch {
      avalancheRegion = null;
      nearbyAvalancheRegions = [];
    }

    const response: StationDetailResponse = {
      station: enrichedStation,
      avalancheRegion,
      nearbyAvalancheRegions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch station" },
      { status: 500 },
    );
  }
}
