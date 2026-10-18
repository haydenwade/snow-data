import { fetchClearScenes } from "@/lib/server/hls-catalog";
import { GeoBounds } from "@/types/station";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Keeps one request to a few HLS tiles; the map only asks when zoomed in.
const MAX_BOX_SPAN_DEGREES = 3;

function parseBbox(raw: string | null): GeoBounds | null {
  if (!raw) return null;
  const parts = raw.split(",").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) return null;
  const [west, south, east, north] = parts;
  if (south >= north || west >= east) return null;
  if (south < -90 || north > 90 || west < -180 || east > 180) return null;
  return { west, south, east, north };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bbox = parseBbox(searchParams.get("bbox"));
  if (!bbox) {
    return NextResponse.json(
      { error: "Missing or invalid bbox (west,south,east,north)" },
      { status: 400 },
    );
  }
  if (bbox.east - bbox.west > MAX_BOX_SPAN_DEGREES || bbox.north - bbox.south > MAX_BOX_SPAN_DEGREES) {
    return NextResponse.json(
      { error: "Area too large — zoom in to search for clear scenes" },
      { status: 400 },
    );
  }

  try {
    const payload = await fetchClearScenes(bbox);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to search imagery catalog" },
      { status: 502 },
    );
  }
}
