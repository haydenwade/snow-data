"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/snow-report/Header";
import StationMap from "../../../components/snow-report/StationMap";
import StationMetadata from "../../../components/snow-report/StationMetadata";
import SnowSummaryStrip from "../../../components/snow-report/SnowSummaryStrip";
import ForecastChart from "../../../components/snow-report/ForecastChart";
import ForecastTimeline from "../../../components/snow-report/ForecastTimeline";
import ForecastTable from "../../../components/snow-report/ForecastTable";
import DataNotes from "../../../components/snow-report/DataNotes";
import CurrentConditions from "../../../components/snow-report/CurrentConditions";
import {
  type Unit,
  type HistoricDay,
  type ForecastDaily,
  type ForecastGridData,
  LOCATIONS,
  aggregateForecastToDaily,
} from "../../../components/snow-report/utils";
import ResortInfoLinks from "@/components/snow-report/ResortInfoLinks";
import AvalancheInfo from "@/components/snow-report/AvalancheInfo";
import TrafficInfo from "@/components/snow-report/TrafficInfo";
import Footer from "@/components/snow-report/Footer";

// Real data loaders (client-side via API routes)
async function fetchHistoric(
  locationId: string,
  days: number
): Promise<HistoricDay[]> {
  const req = await fetch(
    `/api/historic?locationId=${locationId}&days=${days}`,
    { cache: "no-store" }
  );
  if (!req.ok) {
    let detail = "";
    try {
      const j = await req.json();
      detail = j?.error || JSON.stringify(j);
    } catch {}
    throw new Error(
      `Historic fetch failed: ${req.status}${detail ? ` — ${detail}` : ""}`
    );
  }
  const res = await req.json();
  return res.data;
}

async function fetchForecastGrid(
  locationId: string
): Promise<ForecastGridData> {
  const res = await fetch(`/api/forecast?locationId=${locationId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error || JSON.stringify(j);
    } catch {}
    throw new Error(
      `Forecast fetch failed: ${res.status}${detail ? ` — ${detail}` : ""}`
    );
  }
  const j = await res.json();
  return j as ForecastGridData;
}

export default function LocationPage() {
  const params = useParams();
  const locationId = params.location as string;
  const location = LOCATIONS.find((l) => l.id === locationId);

  const [unit, setUnit] = useState<Unit>("in");
  const [range, setRange] = useState<15 | 30>(15);
  const [historic, setHistoric] = useState<HistoricDay[]>([]);
  const [forecast, setForecast] = useState<ForecastDaily[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = async () => {
    if (!location) return;
    try {
      setLoading(true);
      setError(null);
      const hist = await fetchHistoric(locationId, 30);
      const grid = await fetchForecastGrid(locationId);
      const fc = aggregateForecastToDaily(grid);
      setHistoric(hist);
      setForecast(fc);
      setUpdatedAt(new Date());
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [locationId]);

  // For tables we prefer newest first (descending). Keep charts chronological (ascending).
  const lastNHistoricDesc = useMemo(
    () => [...historic.slice(-range)].reverse(),
    [historic, range]
  );
  const lastNDerived = useMemo(() => historic.slice(-range), [historic, range]);

  if (!location) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        Location not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header
        unit={unit}
        range={range}
        onUnit={setUnit}
        onRange={setRange}
        location={location}
      />
      {error && (
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="text-xs text-red-400">{error}</div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section className="grid md:grid-cols-2 gap-6">
          <CurrentConditions locationId={locationId} unit={unit} />
          <ForecastTimeline data={forecast} unit={unit} />
        </section>

        <SnowSummaryStrip
          historic={historic}
          forecast={forecast}
          unit={unit}
          locationId={locationId}
        />
        <section className="grid md:grid-cols-2 gap-6">
          <ForecastChart data={forecast} unit={unit} loading={loading} />
          <ForecastTable data={forecast} unit={unit} />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <ResortInfoLinks location={location} />
          <section className="w-full min-w-0 flex flex-col gap-6">
            <AvalancheInfo location={location} />
            <TrafficInfo location={location} />
          </section>
        </section>

        <section className="grid gap-6 md:grid-cols-3 items-stretch">
          <div className="md:col-span-2 h-full">
            <StationMap location={location} />
          </div>
          <div className="md:col-span-1 h-full">
            <StationMetadata location={location} />
          </div>
        </section>

        <DataNotes location={location} />
        <Footer />
      </main>
    </div>
  );
}
