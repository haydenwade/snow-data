import { fetchSnowDepthAtPoint } from "@/lib/server/snodas";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseCoordinate(value: string | null, limit: number) {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && Math.abs(numeric) <= limit ? numeric : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = parseCoordinate(searchParams.get("lat"), 90);
  const longitude = parseCoordinate(searchParams.get("lon"), 180);

  if (latitude == null || longitude == null) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lon query params" },
      { status: 400 },
    );
  }

  try {
    const payload = await fetchSnowDepthAtPoint(latitude, longitude);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch snow depth" },
      { status: 502 },
    );
  }
}
