"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import LocationTitle from "../../../../components/snow-report/LocationTitle";
import StationMap from "../../../../components/snow-report/StationMap";
import StationMetadata from "../../../../components/snow-report/StationMetadata";
import HistoricChart from "../../../../components/snow-report/HistoricChart";
import HistoricTable from "../../../../components/snow-report/HistoricTable";
import DataNotes from "../../../../components/snow-report/DataNotes";
import Footer from "@/components/snow-report/Footer";
import { HistoricDay } from "@/types/historic";
import { LOCATIONS } from "@/constants/locations";
import { Unit } from "@/types/forecast";
import { fetchHistoric } from "@/lib/api";

export default function LocationPage() {
  const params = useParams();
  const locationId = params.location as string;
  const location = LOCATIONS.find((l) => l.id === locationId);

  const [unit, setUnit] = useState<Unit>("in");
  const [range, setRange] = useState<15 | 30>(15);
  const [historic, setHistoric] = useState<HistoricDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = async () => {
    if (!location) return;
    try {
      setLoading(true);
      setError(null);
      const hist = await fetchHistoric(locationId, 30);
      setHistoric(hist);
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
      <LocationTitle
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
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <a
          href={`/location/${locationId}`}
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
          />
        </section>
        {!loading && (
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
        )}
        <Footer />
      </main>
    </div>
  );
}
