import {
  fetchHistoricByStationTriplet,
  fetchHourlyTemperatureByStationTriplet,
} from "@/lib/server/historic";
import { fetchStationByTriplet } from "@/lib/server/stations";
import { normalizeTripletInput } from "@/lib/station-triplet";
import { HistoricDay, HistoricHourlyTemperaturePoint } from "@/types/historic";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ stationId: string }>;
};

interface GetResponseType {
  error?: string;
  data?: HistoricDay[];
  hourlyTemperature?: HistoricHourlyTemperaturePoint[];
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse<GetResponseType>> {
  const params = await context.params;
  const stationTriplet = normalizeTripletInput(params.stationId);
  if (!stationTriplet) {
    return NextResponse.json(
      { error: "Invalid station triplet format. Expected stationId:stateCode:networkCode" },
      { status: 400 },
    );
  }

  const station = await fetchStationByTriplet(stationTriplet);

  if (!station) {
    return NextResponse.json(
      { error: "No station found matching station triplet" },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") || 30);
  const beginDate = searchParams.get("beginDate");
  const endDate = searchParams.get("endDate");

  try {
    const [data, hourlyTemperature] = await Promise.all([
      fetchHistoricByStationTriplet({
        stationTriplet: station.stationTriplet,
        days,
        beginDate,
        endDate,
      }),
      fetchHourlyTemperatureByStationTriplet({
        stationTriplet: station.stationTriplet,
        dataTimeZoneHours: station.dataTimeZone,
        pastHours: 24 * 7,
      }).catch(() => []),
    ]);

    return NextResponse.json({ data, hourlyTemperature }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch historic data" },
      { status: 500 },
    );
  }
}
