import { getCachedAvalancheMapLayer } from "@/lib/server/avalanche-map-layer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cacheEntry = await getCachedAvalancheMapLayer();
    const ttlSeconds = Math.max(60, cacheEntry.ttlSeconds);

    const nextResponse = NextResponse.json(cacheEntry.rawJson, { status: 200 });
    nextResponse.headers.set(
      "Cache-Control",
      `public, max-age=60, s-maxage=${ttlSeconds}, stale-while-revalidate=300`,
    );
    nextResponse.headers.set("CDN-Cache-Control", `public, s-maxage=${ttlSeconds}`);
    nextResponse.headers.set(
      "Vercel-CDN-Cache-Control",
      `public, s-maxage=${ttlSeconds}, stale-while-revalidate=300`,
    );
    nextResponse.headers.set("X-Snowd-Cache", cacheEntry.cacheStatus);
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch avalanche map layer" },
      { status: 500 },
    );
  }
}
