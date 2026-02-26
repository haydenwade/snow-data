"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LocationTitle from "@/components/snow-report/LocationTitle";
import StationMap from "@/components/snow-report/StationMap";
import StationMetadata from "@/components/snow-report/StationMetadata";
import SnowSummaryStrip from "@/components/snow-report/SnowSummaryStrip";
import ForecastChart from "@/components/snow-report/ForecastChart";
import ForecastTimeline from "@/components/snow-report/ForecastTimeline";
import ForecastTable from "@/components/snow-report/ForecastTable";
import DataNotes from "@/components/snow-report/DataNotes";
import CurrentConditions from "@/components/snow-report/CurrentConditions";
import { aggregateForecastToDaily } from "@/components/snow-report/utils";
import ResortInfoLinks from "@/components/snow-report/ResortInfoLinks";
import AvalancheInfo from "@/components/snow-report/AvalancheInfo";
import TrafficInfo from "@/components/snow-report/TrafficInfo";
import Footer from "@/components/snow-report/Footer";
import SnowLoadingGraphic from "@/components/SnowLoadingGraphic";
import { useUserSettings } from "@/hooks/useUserSettings";
import { normalizeStationKeyInput } from "@/lib/station-key";
import { HistoricDay } from "@/types/historic";
import { ForecastDaily, ForecastGridData } from "@/types/forecast";
import { MountainLocation } from "@/types/location";
import {
  StationAvalancheRegion,
  StationDetailResponse,
  StationNearbyAvalancheRegion,
} from "@/types/station";

async function fetchStationDetail(stationKey: string): Promise<StationDetailResponse> {
  const response = await fetch(`/api/stations/${encodeURIComponent(stationKey)}`, {
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
  stationKey: string,
  days: number,
): Promise<HistoricDay[]> {
  const response = await fetch(
    `/api/stations/${encodeURIComponent(stationKey)}/historic?days=${days}`,
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
  return payload.data as HistoricDay[];
}

async function fetchForecastGrid(
  lat: number,
  lon: number,
): Promise<ForecastGridData> {
  const response = await fetch(
    `/api/forecasts/nws?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
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
      `Forecast fetch failed: ${response.status}${detail ? ` — ${detail}` : ""}`,
    );
  }
  return (await response.json()) as ForecastGridData;
}

export default function StationPage() {
  const params = useParams();
  const stationKey = normalizeStationKeyInput(params.stationTriplet as string);

  const [location, setLocation] = useState<MountainLocation | null>(null);
  const [avalancheRegion, setAvalancheRegion] = useState<StationAvalancheRegion | null>(null);
  const [nearbyAvalancheRegions, setNearbyAvalancheRegions] = useState<
    StationNearbyAvalancheRegion[]
  >([]);
  const { unit } = useUserSettings();
  const [range, setRange] = useState<15 | 30>(15);
  const [historic, setHistoric] = useState<HistoricDay[]>([]);
  const [forecast, setForecast] = useState<ForecastDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationKey) {
      setError("Invalid station identifier");
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setAvalancheRegion(null);
        setNearbyAvalancheRegions([]);

        const detail = await fetchStationDetail(stationKey);
        if (!mounted) return;
        setLocation(detail.location);
        setAvalancheRegion(detail.avalancheRegion ?? null);
        setNearbyAvalancheRegions(detail.nearbyAvalancheRegions ?? []);

        const [historicResult, forecastResult] = await Promise.allSettled([
          fetchHistoric(stationKey, 30),
          fetchForecastGrid(
            detail.location.lat,
            detail.location.lon,
          ),
        ]);
        if (!mounted) return;

        if (historicResult.status === "rejected") {
          throw historicResult.reason;
        }

        setHistoric(historicResult.value);

        if (forecastResult.status === "fulfilled") {
          const dailyForecast = aggregateForecastToDaily(
            forecastResult.value,
            detail.location.timezone,
          );
          setForecast(dailyForecast);
        } else {
          setForecast([]);
          setError(
            "Forecast unavailable for this station. Historic and current conditions are still available.",
          );
        }
      } catch (err) {
        if (!mounted) return;
        setError((err as Error)?.message ?? "Failed to load station data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [stationKey]);

  if (!stationKey) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        Invalid station identifier
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        {loading ? (
          <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
            <SnowLoadingGraphic />
          </div>
        ) : (
          "Station not found"
        )}
      </div>
    );
  }

  const todayAndFutureForecast = forecast.filter((day) => {
    const today = new Date();
    const dayDate = new Date(`${day.date}T00:00:00`);
    return dayDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const showForecastSections = loading || forecast.length > 0;
  const showAvalancheInfo = !loading && (avalancheRegion != null || nearbyAvalancheRegions.length > 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <LocationTitle
        range={range}
        onRange={setRange}
        location={location}
      />

      {error ? (
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="text-xs text-red-400">{error}</div>
        </div>
      ) : null}

      <main className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6">
        <CurrentConditions stationKey={stationKey} unit={unit}>
          {showAvalancheInfo ? (
            <AvalancheInfo
              loading={loading}
              avalancheRegion={avalancheRegion}
              nearbyAvalancheRegions={nearbyAvalancheRegions}
            />
          ) : null}
        </CurrentConditions>

        {showForecastSections ? (
          <>
            <SnowSummaryStrip
              historic={historic}
              forecast={todayAndFutureForecast}
              unit={unit}
              stationKey={stationKey}
              loading={loading}
            />
            <ForecastTimeline data={forecast} unit={unit} loading={loading} />

            <section className="grid md:grid-cols-2 gap-6">
              <ForecastChart data={todayAndFutureForecast} unit={unit} loading={loading} />
              <ForecastTable
                data={todayAndFutureForecast}
                unit={unit}
                loading={loading}
              />
            </section>
          </>
        ) : (
          <section className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
            <h2 className="font-semibold text-white">Forecast Unavailable</h2>
            <p className="mt-2 text-sm text-slate-300">
              No forecast provider currently has data for this station.
            </p>
          </section>
        )}

        <section className="grid md:grid-cols-2 gap-6">
          <ResortInfoLinks location={location} loading={loading} />
          <TrafficInfo location={location} loading={loading} />
        </section>

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
