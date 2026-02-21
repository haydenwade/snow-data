"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import LocationTitle from "@/components/snow-report/LocationTitle";
import StationMap from "@/components/snow-report/StationMap";
import StationMetadata from "@/components/snow-report/StationMetadata";
import HistoricChart from "@/components/snow-report/HistoricChart";
import HistoricTable from "@/components/snow-report/HistoricTable";
import DataNotes from "@/components/snow-report/DataNotes";
import Footer from "@/components/snow-report/Footer";
import HistoricTemperatureChart from "@/components/stations/HistoricTemperatureChart";
import { HistoricDay, HistoricHourlyTemperaturePoint } from "@/types/historic";
import { Unit } from "@/types/forecast";
import { MountainLocation } from "@/types/location";
import { StationDetailResponse } from "@/types/station";

async function fetchStationDetail(stationId: string): Promise<StationDetailResponse> {
  const response = await fetch(`/api/stations/${encodeURIComponent(stationId)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = "";
    try {
      const json = await response.json();
      detail = json?.error || JSON.stringify(json);
    } catch {
      // ignore parse errors
    }
    throw new Error(
      `Station fetch failed: ${response.status}${detail ? ` — ${detail}` : ""}`,
    );
  }
  return (await response.json()) as StationDetailResponse;
}

async function fetchHistoric(
  stationId: string,
  days: number,
): Promise<{
  data: HistoricDay[];
  hourlyTemperature: HistoricHourlyTemperaturePoint[];
}> {
  const response = await fetch(
    `/api/stations/${encodeURIComponent(stationId)}/historic?days=${days}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    let detail = "";
    try {
      const json = await response.json();
      detail = json?.error || JSON.stringify(json);
    } catch {
      // ignore parse errors
    }
    throw new Error(
      `Historic fetch failed: ${response.status}${detail ? ` — ${detail}` : ""}`,
    );
  }
  const payload = await response.json();
  return {
    data: (payload.data ?? []) as HistoricDay[],
    hourlyTemperature:
      (payload.hourlyTemperature ?? []) as HistoricHourlyTemperaturePoint[],
  };
}

export default function StationHistoricPage() {
  const params = useParams();
  const stationId = params.stationId as string;

  const [location, setLocation] = useState<MountainLocation | null>(null);
  const [unit, setUnit] = useState<Unit>("in");
  const [range, setRange] = useState<15 | 30>(15);
  const [historic, setHistoric] = useState<HistoricDay[]>([]);
  const [hourlyTemperature, setHourlyTemperature] = useState<
    HistoricHourlyTemperaturePoint[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await fetchStationDetail(stationId);
        if (!mounted) return;
        setLocation(detail.location);

        const response = await fetchHistoric(stationId, 30);
        if (!mounted) return;
        setHistoric(response.data);
        setHourlyTemperature(response.hourlyTemperature);
      } catch (err) {
        if (!mounted) return;
        setError((err as Error)?.message || "Failed to load data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [stationId]);

  const lastNHistoricDesc = useMemo(
    () => [...historic.slice(-range)].reverse(),
    [historic, range],
  );
  const lastNDerived = useMemo(() => historic.slice(-range), [historic, range]);

  if (!location) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        {loading ? "Loading station..." : "Station not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <LocationTitle
        unit={unit}
        range={range}
        onUnit={setUnit}
        onRange={setRange}
        location={location}
      />

      {error ? (
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="text-xs text-red-400">{error}</div>
        </div>
      ) : null}

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <a
          href={`/stations/${encodeURIComponent(stationId)}`}
          className="inline-block mb-4 px-2 py-1 rounded border border-slate-500 text-slate-400 text-sm hover:bg-slate-700/20 hover:text-slate-200 transition"
        >
          ← Back to Forecast
        </a>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6">
        <section className="grid md:grid-cols-2 gap-6">
          <HistoricChart data={lastNDerived} unit={unit} loading={loading} />
          <HistoricTable
            data={lastNHistoricDesc}
            unit={unit}
            loading={loading}
            showTemperatureColumns
          />
        </section>
        <HistoricTemperatureChart
          data={hourlyTemperature}
          unit={unit}
          loading={loading}
        />
        {!loading ? (
          <>
            <section className="grid gap-6 md:grid-cols-3 items-stretch">
              <div className="md:col-span-2 h-full">
                <StationMap location={location} loading={loading} />
              </div>
              <div className="md:col-span-1 h-full">
                <StationMetadata location={location} loading={loading} />
              </div>
            </section>

            <DataNotes location={location} />
          </>
        ) : null}
        <Footer />
      </main>
    </div>
  );
}
