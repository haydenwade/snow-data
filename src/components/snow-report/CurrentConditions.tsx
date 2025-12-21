"use client";
import { useEffect, useState } from "react";
import { Loader2, Wind, Sun, Thermometer, Cloud, CloudSun, Cloudy, CloudSnow } from "lucide-react";
import type { Unit } from "./utils";
function SkyIcon({ sky }: { sky?: string | null }) {
  const s = (sky ?? "").trim().toLowerCase();
  if (!s) return <Cloud className="h-4 w-4 text-slate-300" />;
  if (s === "clear") return <Sun className="h-4 w-4 text-yellow-400" />;
  if (s === "mostly clear") return <CloudSun className="h-4 w-4 text-yellow-300" />;
  if (s === "partly cloudy") return <CloudSun className="h-4 w-4 text-yellow-300" />;
  if (s === "mostly cloudy") return <Cloud className="h-4 w-4 text-slate-300" />;
  if (s === "overcast") return <Cloudy className="h-4 w-4 text-slate-400" />;
  if (s.includes("snow")) return <CloudSnow className="h-4 w-4 text-slate-400" />;
  return <Cloud className="h-4 w-4 text-slate-300" />;
}

import { degToCompass } from "./utils";
type CurrentResp = {
  observedAt?: string | null;
  temperatureF?: number | null;
  wind?: {
    speedMph?: number | null;
    directionDeg?: number | null;
    windLabel?: string | null;
  } | null;
  sky?: string | null;
};

export default function CurrentConditions({
  locationId,
  unit = "in",
}: {
  locationId: string;
  unit?: Unit;
}) {
  const [data, setData] = useState<CurrentResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch(`/api/current?locationId=${encodeURIComponent(locationId)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`status:${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (!mounted) return;
        setData(j);
      })
      .catch((e) => {
        if (!mounted) return;
        setError("Failed to load current conditions");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [locationId]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-red-400" />
          <h2 className="font-semibold text-white">Current Conditions</h2>
          {data && data.observedAt && (
            <span className="text-xs text-slate-400 ml-3">
              Obs: {new Date(data.observedAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading
          </div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : data ? (
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-white">
                {unit === "mm"
                  ? data.temperatureF != null
                    ? `${Math.round(((data.temperatureF - 32) * 5) / 9)}°C`
                    : "—"
                  : data.temperatureF != null
                  ? `${data.temperatureF}°F`
                  : "—"}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <SkyIcon sky={data.sky} />
                <div>
                  <div className="text-xs text-slate-400">Sky</div>
                  <div className="font-medium text-slate-200">
                    {data.sky ?? "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-sky-400" />
                <div>
                  <div className="text-xs text-slate-400">Wind</div>
                  <div className="font-medium text-slate-200">
                    {data.wind?.speedMph != null &&
                    data.wind?.directionDeg != null
                      ? unit === "mm"
                        ? `${Math.round(
                            data.wind.speedMph * 1.60934
                          )} kph ${degToCompass(data.wind.directionDeg)}`
                        : `${data.wind.speedMph} mph ${degToCompass(
                            data.wind.directionDeg
                          )}`
                      : "—"}
                    <span className="text-xs text-slate-400 ml-2">
                      {data.wind?.windLabel ?? ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400">No data</div>
        )}
      </div>
    </div>
  );
}
