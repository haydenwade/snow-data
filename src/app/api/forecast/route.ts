import { LOCATIONS } from "@/constants/locations";
import { fetchNwsForecastGridData } from "@/lib/server/nws-forecast";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const location = LOCATIONS.find((entry) => entry.id === locationId);

    if (!location) {
      return NextResponse.json(
        { error: "No location found matching locationId" },
        { status: 404 },
      );
    }

    const payload = await fetchNwsForecastGridData(location.lat, location.lon);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch forecast data" },
      { status: 500 },
    );
  }
}
