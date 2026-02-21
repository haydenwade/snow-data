import { fetchAwdbJson } from "@/lib/server/awdb";
import { resolveStation } from "@/lib/server/stations";
import { SnotelForecastSummary } from "@/types/station";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ForecastDto = {
  stationTriplet?: string;
  forecastPointName?: string;
  data?: Array<{
    elementCode?: string;
    forecastPeriod?: string[];
    forecastStatus?: string;
    issueDate?: string;
    publicationDate?: string;
    unitCode?: string;
    periodNormal?: number;
    forecastValues?: Record<string, number>;
  }>;
};

function summarizeForecastData(forecasts: ForecastDto[]) {
  const out: SnotelForecastSummary[] = [];

  for (const stationForecast of forecasts) {
    for (const row of stationForecast.data ?? []) {
      out.push({
        elementCode: row.elementCode ?? null,
        forecastPeriod: row.forecastPeriod ?? null,
        forecastStatus: row.forecastStatus ?? null,
        issueDate: row.issueDate ?? null,
        publicationDate: row.publicationDate ?? null,
        unitCode: row.unitCode ?? null,
        periodNormal:
          row.periodNormal == null || Number.isNaN(row.periodNormal)
            ? null
            : row.periodNormal,
        forecastValues: row.forecastValues ?? {},
      });
    }
  }

  return out.sort((a, b) =>
    String(b.publicationDate ?? "").localeCompare(String(a.publicationDate ?? "")),
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get("stationId");

    if (!stationId) {
      return NextResponse.json(
        { error: "Missing stationId query param" },
        { status: 400 },
      );
    }

    const station = await resolveStation(stationId);
    if (!station) {
      return NextResponse.json(
        { error: "No station found matching stationId" },
        { status: 404 },
      );
    }

    const beginPublicationDate = searchParams.get("beginPublicationDate");
    const endPublicationDate = searchParams.get("endPublicationDate");
    const elementCodes = searchParams.get("elementCodes");
    const forecastPeriods = searchParams.get("forecastPeriods");

    const forecasts = await fetchAwdbJson<ForecastDto[]>("/forecasts", {
      stationTriplets: station.stationTriplet,
      exceedenceProbabilities: "10,30,50,70,90",
      beginPublicationDate: beginPublicationDate ?? undefined,
      endPublicationDate: endPublicationDate ?? undefined,
      elementCodes: elementCodes ?? undefined,
      forecastPeriods: forecastPeriods ?? undefined,
    });

    const summary = summarizeForecastData(forecasts);

    return NextResponse.json(
      {
        stationId: station.stationId,
        stationTriplet: station.stationTriplet,
        forecastCount: summary.length,
        summary,
        raw: forecasts,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch SNOTEL forecast" },
      { status: 500 },
    );
  }
}
