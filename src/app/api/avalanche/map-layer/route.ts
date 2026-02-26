import { getCachedAvalancheMapLayer } from "@/lib/server/avalanche-map-layer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isIsoDate(value: string | null) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedDate = url.searchParams.get("date");
    if (requestedDate != null && !isIsoDate(requestedDate)) {
      return NextResponse.json(
        { error: "Invalid date. Expected YYYY-MM-DD." },
        { status: 400 },
      );
    }

    const cacheEntry = await getCachedAvalancheMapLayer(
      requestedDate ? { date: requestedDate } : undefined,
    );
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
