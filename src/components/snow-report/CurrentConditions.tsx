"use client";
import { useEffect, useMemo, useState } from "react";
import { Wind, Sunrise, Sunset, Thermometer } from "lucide-react";
import CurrentConditionsSkeleton from "../skeletons/CurrentConditionsSkeleton";
import CurrentConditionsChart from "./CurrentConditionsChart";
import { Unit } from "@/types/forecast";
import { ApiResp } from "@/types/current-conditions-response";
import {
  celsiusFromF,
  formatObservedLabel,
  formatTimeInZone,
  kphFromMph,
} from "./utils";
import { SkyIcon } from "./SkyIcon";

export default function CurrentConditions({
  stationTriplet,
  unit = "in",
}: {
  stationTriplet?: string;
  unit?: Unit;
}) {
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const endpoint = stationTriplet
      ? `/api/stations/${encodeURIComponent(stationTriplet)}/current`
      : null;

    if (!endpoint) {
      setError("Missing station identifier");
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    fetch(endpoint)
      .then(async (r) => {
        if (!r.ok) throw new Error(`status:${r.status}`);
        return r.json();
      })
      .then((j: ApiResp) => {
        if (!mounted) return;
        setResp(j);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load current conditions");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [stationTriplet]);

  const current = resp?.currentData ?? null;

  const observedLabel = useMemo(() => {
    if (!current) return null;
    const observedAt = stationTriplet
      ? (resp?.lastUpdatedAt ?? current.observedAt)
      : current.observedAt;
    const t = formatObservedLabel(observedAt);
    if (!t) return null;
    const src = stationTriplet
      ? "Temp Obs"
      : current.source === "observation"
        ? "Obs"
        : "Forecast";
    return `${src}: ${t}`;
  }, [current, resp?.lastUpdatedAt, stationTriplet]);

  const sunriseLabel = useMemo(() => {
    if (!current?.sun?.sunrise) return null;
    return formatTimeInZone(
      current.sun.sunrise,
      current.sun.timeZone ?? undefined,
    );
  }, [current]);

  const sunsetLabel = useMemo(() => {
    if (!current?.sun?.sunset) return null;
    return formatTimeInZone(
      current.sun.sunset,
      current.sun.timeZone ?? undefined,
    );
  }, [current]);

  if (loading) return <CurrentConditionsSkeleton />;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-red-400" />
          <h2 className="font-semibold text-white">Current Conditions</h2>
          {observedLabel ? (
            <span className="text-xs text-slate-400 ml-3">{observedLabel}</span>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        {error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : !resp || !current ? (
          <div className="text-slate-400">No data</div>
        ) : (
          <div className="space-y-4">
            {/* Current "Now" Card */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Now</div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <div className="text-4xl font-bold text-white">
                      {current.temperatureF == null
                        ? "—"
                        : unit === "mm"
                          ? `${celsiusFromF(current.temperatureF)}°C`
                          : `${current.temperatureF}°F`}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <SkyIcon sky={current.conditionText} />
                      <div>
                        <div className="text-xs text-slate-400">Sky</div>
                        <div className="font-medium text-slate-200">
                          {current.conditionText ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-sky-400" />
                      <div>
                        <div className="text-xs text-slate-400">Wind</div>
                        <div className="font-medium text-slate-200">
                          {current.wind?.speedMph == null
                            ? "—"
                            : unit === "mm"
                              ? `${kphFromMph(current.wind.speedMph)} kph`
                              : `${current.wind.speedMph} mph`}
                          {current.wind?.directionText ? (
                            <span className="text-slate-400 ml-2">
                              {current.wind.directionText}
                            </span>
                          ) : null}
                          {current.wind?.label ? (
                            <span className="text-xs text-slate-400 ml-2">
                              {current.wind.label}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Sunrise */}
                    <div className="flex items-center gap-2">
                      <Sunrise className="h-4 w-4 text-amber-300" />
                      <div>
                        <div className="text-xs text-slate-400">Sunrise</div>
                        <div className="font-medium text-slate-200">
                          {sunriseLabel ?? "—"}
                        </div>
                      </div>
                    </div>

                    {/* Sunset */}
                    <div className="flex items-center gap-2">
                      <Sunset className="h-4 w-4 text-orange-400" />
                      <div>
                        <div className="text-xs text-slate-400">Sunset</div>
                        <div className="font-medium text-slate-200">
                          {sunsetLabel ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional status line */}
                  <div className="mt-3 text-xs text-slate-400">
                    {stationTriplet && resp?.lastUpdatedAt
                      ? `Temperature from SNOTEL observation (${formatObservedLabel(resp.lastUpdatedAt)}).`
                      : current.isObserved
                        ? current.isObservationStale
                          ? "Observation is stale — showing latest available."
                          : "Live observation."
                        : "Approximate (hourly forecast)."}
                  </div>
                </div>

                {/* Big icon */}
                <div className="flex flex-col items-end">
                  <SkyIcon sky={current.conditionText} className="h-20 w-20" />
                </div>
              </div>
            </div>

            <CurrentConditionsChart resp={resp} unit={unit} />
          </div>
        )}
      </div>
    </div>
  );
}
