import { fetchNwsForecastGridData } from "@/lib/server/nws-forecast";
import { fetchOpenMeteoForecastGridData } from "@/lib/server/open-meteo-forecast";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseCoordinate(value: string | null) {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function isNwsInvalidPointError(message: string) {
  return (
    message.includes("InvalidPoint") ||
    message.includes("Data Unavailable For Requested Point")
  );
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
    try {
      const payload = await fetchNwsForecastGridData(lat, lon);
      return NextResponse.json(payload, { status: 200 });
    } catch (error) {
      const message = (error as Error)?.message || "Failed to fetch NWS forecast";
      if (!isNwsInvalidPointError(message)) {
        throw error;
      }
      const payload = await fetchOpenMeteoForecastGridData(lat, lon);
      return NextResponse.json(payload, { status: 200 });
    }
  } catch (error) {
    const message = (error as Error)?.message || "Failed to fetch forecast";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
