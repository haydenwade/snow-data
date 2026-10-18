import { fetchRadarFrames } from "@/lib/server/radar-frames";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const payload = await fetchRadarFrames();
    const nextResponse = NextResponse.json(payload, { status: 200 });
    nextResponse.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
    );
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch radar frames" },
      { status: 502 },
    );
  }
}
