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
    const latitude = parseCoordinate(searchParams.get("latitude"));
    const longitude = parseCoordinate(searchParams.get("longitude"));

    if (latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "Missing or invalid latitude/longitude query params" },
        { status: 400 },
      );
    }
    try {
      const payload = await fetchNwsForecastGridData(latitude, longitude);
      return NextResponse.json(payload, { status: 200 });
    } catch (error) {
      const message = (error as Error)?.message || "Failed to fetch NWS forecast";
      if (!isNwsInvalidPointError(message)) {
        throw error;
      }
      const payload = await fetchOpenMeteoForecastGridData(latitude, longitude);
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
