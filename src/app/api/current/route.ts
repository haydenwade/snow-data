import { NextResponse } from "next/server";
import { LOCATIONS, cToF } from "../../../components/snow-report/utils";

// NWS grid/windSpeed values are km/h for these endpoints; convert to mph
function kphToMph(kph?: number | null) {
  if (kph == null || Number.isNaN(kph)) return null;
  return kph * 0.621371;
}

function windLabel(mph?: number | null) {
  if (mph == null || Number.isNaN(mph)) return "Calm";
  const s = Math.abs(mph);
  if (s < 1) return "Calm";
  if (s < 6) return "Light";
  if (s < 15) return "Moderate";
  if (s < 25) return "Fresh";
  if (s < 40) return "Strong";
  return "Gale";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const locationId = url.searchParams.get("locationId");
    if (!locationId) {
      return NextResponse.json(
        { error: "missing locationId" },
        { status: 400 }
      );
    }

    const loc = LOCATIONS.find((l) => l.id === locationId);
    if (!loc) {
      return NextResponse.json(
        { error: "unknown locationId" },
        { status: 404 }
      );
    }

    const pointsRes = await fetch(
      `https://api.weather.gov/points/${loc.lat},${loc.lon}`,
      {
        headers: { "User-Agent": "snow-data (github.com)" },
      }
    );
    if (!pointsRes.ok) {
      return NextResponse.json(
        { error: "failed to fetch points" },
        { status: 502 }
      );
    }
    const pointsJson = await pointsRes.json();
    const stationsUrl = pointsJson?.properties?.observationStations;
    if (!stationsUrl) {
      return NextResponse.json(
        { error: "no observationStations for point" },
        { status: 502 }
      );
    }

    const stationsRes = await fetch(stationsUrl, {
      headers: { "User-Agent": "snow-data (github.com)" },
    });
    if (!stationsRes.ok) {
      return NextResponse.json(
        { error: "failed to fetch stations" },
        { status: 502 }
      );
    }
    const stationsJson = await stationsRes.json();
    const firstFeature = stationsJson?.features && stationsJson.features[0];
    if (!firstFeature) {
      return NextResponse.json({ error: "no stations found" }, { status: 502 });
    }

    const stationId =
      firstFeature.properties?.stationIdentifier || firstFeature.id || null;
    if (!stationId) {
      return NextResponse.json(
        { error: "unable to determine station id" },
        { status: 502 }
      );
    }

    const obsRes = await fetch(
      `https://api.weather.gov/stations/${stationId}/observations/latest`,
      {
        headers: { "User-Agent": "snow-data (github.com)" },
      }
    );
    if (!obsRes.ok) {
      return NextResponse.json(
        { error: "failed to fetch latest observation" },
        { status: 502 }
      );
    }
    const obsJson = await obsRes.json();
    const props = obsJson?.properties || {};

    const tempC = props.temperature?.value;
    const tempF = typeof tempC === "number" ? Math.round(cToF(tempC)) : null;

    const windKph = props.windSpeed?.value;
    const kphToMphResult = typeof windKph === "number" ? kphToMph(windKph) : null;
    const windMph = typeof kphToMphResult === "number" ? Math.round(kphToMphResult) : null;
    const windDirDeg = props.windDirection?.value ?? null;

    const sky =
      props.textDescription ?? props.weather?.[0]?.description ?? null;

    return NextResponse.json(
      {
        temperatureF: tempF,
        wind: {
          speedMph: windMph,
          directionDeg: windDirDeg,
          windLabel: windLabel(windMph),
        },
        sky,
      },
      { status: 200 }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/api/current error", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
