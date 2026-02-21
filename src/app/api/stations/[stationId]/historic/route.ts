import { fetchHistoricByStationTriplet } from "@/lib/server/historic";
import { resolveStation } from "@/lib/server/stations";
import { HistoricDay } from "@/types/historic";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ stationId: string }>;
};

interface GetResponseType {
  error?: string;
  data?: HistoricDay[];
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse<GetResponseType>> {
  const params = await context.params;
  const stationId = params.stationId;
  const station = await resolveStation(stationId);

  if (!station) {
    return NextResponse.json(
      { error: "No station found matching stationId" },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") || 30);
  const beginDate = searchParams.get("beginDate");
  const endDate = searchParams.get("endDate");

  try {
    const data = await fetchHistoricByStationTriplet({
      stationTriplet: station.stationTriplet,
      days,
      beginDate,
      endDate,
    });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch historic data" },
      { status: 500 },
    );
  }
}
