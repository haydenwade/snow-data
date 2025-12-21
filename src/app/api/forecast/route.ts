import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SeriesPoint = { start: string; hours: number; value: number };
type GridSeries = { uom: string; points: SeriesPoint[] };

function parseValidTime(validTime: string): { start: string; hours: number } {
  const [start, dur] = validTime.split("/");
  let hours = 0;
  const m = /PT(\d+)([HMS])/i.exec(dur || "");
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2].toUpperCase();
    hours = unit === "H" ? n : unit === "M" ? n / 60 : unit === "S" ? n / 3600 : 0;
  }
  return { start, hours };
}

export async function GET() {
  try {
    // Step 1: grid lookup
    const pointsRes = await fetch("https://api.weather.gov/points/40.59,-111.64", {
      headers: {
        // Per api.weather.gov policy, include a descriptive UA with contact info
        "User-Agent": "AltaSnowReport/1.0 (snow-data dev; contact: support@alta-snow.local)",
        "Accept": "application/geo+json",
      },
      cache: "no-store",
    });
    if (!pointsRes.ok) {
      const body = await pointsRes.text().catch(() => "");
      return NextResponse.json({ error: `Points fetch failed: ${pointsRes.status}`, body }, { status: 502 });
    }
    const points = await pointsRes.json();
    const gridUrl: string | undefined = points?.properties?.forecastGridData;
    if (!gridUrl) {
      return NextResponse.json({ error: "Missing forecastGridData URL" }, { status: 502 });
    }

    // Step 2: grid data
    const gridRes = await fetch(gridUrl, {
      headers: {
        "User-Agent": "AltaSnowReport/1.0 (snow-data dev; contact: support@alta-snow.local)",
        "Accept": "application/geo+json",
      },
      cache: "no-store",
    });
    if (!gridRes.ok) {
      const body = await gridRes.text().catch(() => "");
      return NextResponse.json({ error: `Grid fetch failed: ${gridRes.status}`, body }, { status: 502 });
    }
    const grid = await gridRes.json();
    const props = grid?.properties || {};

    function mapSeries(key: string): GridSeries {
      const s = props[key] || {};
      const uom = s.uom || "";
      const values: any[] = s.values || [];
      const points: SeriesPoint[] = values.map((v) => {
        const { start, hours } = parseValidTime(String(v.validTime || ""));
        const value = v.value == null ? 0 : Number(v.value);
        return { start, hours: hours || 1, value: Number.isFinite(value) ? value : 0 };
      });
      return { uom, points };
    }

    const payload = {
      snowfallAmount: mapSeries("snowfallAmount"),
      quantitativePrecipitation: mapSeries("quantitativePrecipitation"),
      probabilityOfPrecipitation: mapSeries("probabilityOfPrecipitation"),
      temperature: mapSeries("temperature"),
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
