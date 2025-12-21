"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/snow-report/Header";
import StationMap from "../components/snow-report/StationMap";
import StationMetadata from "../components/snow-report/StationMetadata";
import SnowSummaryStrip from "../components/snow-report/SnowSummaryStrip";
import HistoricChart from "../components/snow-report/HistoricChart";
import ForecastChart from "../components/snow-report/ForecastChart";
import HistoricTable from "../components/snow-report/HistoricTable";
import ForecastTable from "../components/snow-report/ForecastTable";
import DataNotes from "../components/snow-report/DataNotes";
import {
  type Unit,
  type HistoricDay,
  type ForecastDaily,
  type ForecastGridData,
  deriveDailySnowfall,
  aggregateForecastToDaily,
} from "../components/snow-report/utils";

// helper imports moved into components/snow-report/utils

// Real data loaders (client-side via API routes)
async function fetchHistoric(days: number): Promise<{ date: string; snowDepth: number | null; swe: number | null }[]> {
  const res = await fetch(`/api/historic?days=${days}`, { cache: "no-store" });
  if (!res.ok) {
    let detail = "";
    try { const j = await res.json(); detail = j?.error || JSON.stringify(j); } catch {}
    throw new Error(`Historic fetch failed: ${res.status}${detail ? ` — ${detail}` : ""}`);
  }
  const data = await res.json();
  const arr = Array.isArray(data) ? data : (data?.data ?? []);
  // Map new schema {date, snowDepth, swe, precip} → UI shape {date, snowDepth, swe}
  return arr.map((r: any) => ({
    date: r.date,
    snowDepth: r.snowDepth ?? r.snwDepth ?? null,
    swe: r.swe ?? r.WTEQ ?? null,
  }));
}

async function fetchForecastGrid(): Promise<ForecastGridData> {
  const res = await fetch(`/api/forecast`, { cache: "no-store" });
  if (!res.ok) {
    let detail = "";
    try { const j = await res.json(); detail = j?.error || JSON.stringify(j); } catch {}
    throw new Error(`Forecast fetch failed: ${res.status}${detail ? ` — ${detail}` : ""}`);
  }
  const j = await res.json();
  return j as ForecastGridData;
}

// UI components are now split into files under components/snow-report

export default function Home() {
  const [unit, setUnit] = useState<Unit>("in");
  const [range, setRange] = useState<15 | 30>(15);
  const [historic, setHistoric] = useState<HistoricDay[]>([]);
  const [forecast, setForecast] = useState<ForecastDaily[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const histRaw = await fetchHistoric(30);
      const hist = deriveDailySnowfall(histRaw);
      const grid = await fetchForecastGrid();
      const fc = aggregateForecastToDaily(grid);
      setHistoric(hist);
      setForecast(fc);
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  // For tables we prefer newest first (descending). Keep charts chronological (ascending).
  const lastNHistoricDesc = useMemo(() => [...historic.slice(-range)].reverse(), [historic, range]);
  const last15Derived = useMemo(() => historic.slice(-15), [historic]);

  const histLabels = last15Derived.map((d) => d.date);
  const histValues = last15Derived.map((d) => d.derivedSnowfallIn);

  const fcLabels = forecast.map((d) => d.date);
  const fcValues = forecast.map((d) => d.snowIn);
  const fcPops = forecast.map((d) => d.pop);

  const toUnit = (v: number) => unit === "in" ? v : v * 25.4;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header unit={unit} range={range} loading={loading} onUnit={setUnit} onRange={setRange} onRefresh={load} />
      {error && (
        <div className="max-w-6xl mx-auto px-4 pb-3"><div className="text-xs text-red-400">{error}</div></div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <StationMap />
        <StationMetadata />

        <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50"><h2 className="text-sm font-semibold tracking-wide text-white">Snow Summary</h2></div>
          <div className="p-4"><SnowSummaryStrip historic={historic} forecast={forecast} unit={unit} /></div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <HistoricChart labels={histLabels} values={histValues} unit={unit} />
          <ForecastChart labels={fcLabels} values={fcValues} pops={fcPops} unit={unit} />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <HistoricTable data={lastNHistoricDesc} unit={unit} />
          <ForecastTable data={forecast} unit={unit} />
        </section>

        <DataNotes />
      </main>
    </div>
  );
}
