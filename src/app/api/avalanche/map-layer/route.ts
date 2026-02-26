import { NextResponse } from "next/server";

export const runtime = "nodejs";

const AVALANCHE_MAP_LAYER_URL =
  "https://api.avalanche.org/v2/public/products/map-layer";

export async function GET() {
  try {
    const response = await fetch(AVALANCHE_MAP_LAYER_URL, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Avalanche.org map-layer request failed (${response.status}): ${body.slice(0, 300)}`,
        },
        { status: 502 },
      );
    }

    const json = await response.json();
    const nextResponse = NextResponse.json(json, { status: 200 });
    nextResponse.headers.set("Cache-Control", "public, max-age=300");
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch avalanche map layer" },
      { status: 500 },
    );
  }
}
