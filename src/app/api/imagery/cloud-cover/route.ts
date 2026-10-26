import { fetchCloudCoverDays } from "@/lib/server/open-meteo-clouds";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (
    !searchParams.get("lat") ||
    !searchParams.get("lon") ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    return NextResponse.json({ error: "Missing or invalid lat/lon" }, { status: 400 });
  }

  try {
    const payload = await fetchCloudCoverDays(lat, lon);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to load cloud cover" },
      { status: 502 },
    );
  }
}
