import { fetchNwsForecastGridData } from "@/lib/server/nws-forecast";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseCoordinate(value: string | null) {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseCoordinate(searchParams.get("lat"));
    const lon = parseCoordinate(searchParams.get("lon"));

    if (lat == null || lon == null) {
      return NextResponse.json(
        { error: "Missing or invalid lat/lon query params" },
        { status: 400 },
      );
    }

    const payload = await fetchNwsForecastGridData(lat, lon);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch NWS forecast" },
      { status: 500 },
    );
  }
}
