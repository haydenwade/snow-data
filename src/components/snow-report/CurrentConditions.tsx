"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wind,
  Sun,
  Thermometer,
  Cloud,
  CloudSun,
  Cloudy,
  CloudSnow,
  Droplets,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import type { Unit } from "./utils";
import CurrentConditionsSkeleton from "../skeletons/CurrentConditionsSkeleton";

function SkyIcon({ sky, className }: { sky?: string | null; className?: string }) {
  const s = (sky ?? "").trim().toLowerCase();
  if (!s) return <Cloud className={className ?? "h-4 w-4 text-slate-300"} />;
  if (s === "clear") return <Sun className={className ?? "h-4 w-4 text-yellow-400"} />;
  if (s === "mostly clear") return <CloudSun className={className ?? "h-4 w-4 text-yellow-300"} />;
  if (s === "partly cloudy") return <CloudSun className={className ?? "h-4 w-4 text-yellow-300"} />;
  if (s === "mostly cloudy") return <Cloud className={className ?? "h-4 w-4 text-slate-300"} />;
  if (s === "overcast") return <Cloudy className={className ?? "h-4 w-4 text-slate-400"} />;
  if (s.includes("snow")) return <CloudSnow className={className ?? "h-4 w-4 text-slate-300"} />;
  return <Cloud className={className ?? "h-4 w-4 text-slate-300"} />;
}

type TimeseriesPoint = {
  startTime: string | null;
  hourLabel: string | null;
  temperatureF: number | null;
  precipChancePct: number | null;
  wind: {
    speedMph: number | null;
    directionText: string | null;
    label: string | null;
  } | null;
  sky: string | null;
};

type ApiResp = {
  currentData: {
    locationId: string;
    stationId: string | null;
    source: "observation" | "forecast";
    observedAt: string | null;
    ageMin: number | null;

    isObserved: boolean;
    isObservationStale: boolean | null;

    temperatureF: number | null;
    conditionText: string | null;

    wind: {
      speedMph: number | null;
      directionDeg: number | null;
      directionText: string | null;
      arrowRotation: number | null;
      label: string | null;
    } | null;
  };
  timeseriesData: TimeseriesPoint[];
};

type TabKey = "temp" | "wind" | "precip";

function formatObservedLabel(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

function celsiusFromF(f: number) {
  return Math.round(((f - 32) * 5) / 9);
}

function kphFromMph(mph: number) {
  return Math.round(mph * 1.60934);
}

function skyCode(sky?: string | null) {
  const s = (sky ?? "").trim().toLowerCase();
  if (!s) return 0;
  if (s.includes("snow")) return 5;
  if (s === "overcast") return 4;
  if (s === "mostly cloudy" || s === "cloudy") return 3;
  if (s === "partly cloudy" || s === "mostly clear") return 2;
  if (s === "clear") return 1;
  return 2;
}

function skyLabelFromCode(code: number) {
  if (code >= 5) return "Snow";
  if (code === 4) return "Overcast";
  if (code === 3) return "Cloudy";
  if (code === 2) return "Partly";
  if (code === 1) return "Clear";
  return "—";
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition",
        active
          ? "bg-slate-700/50 border-slate-600 text-white"
          : "bg-slate-900/20 border-slate-700/60 text-slate-300 hover:bg-slate-800/30",
      ].join(" ")}
      type="button"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
  tab,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit: Unit;
  tab: TabKey;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0]?.payload;

  const hour = p?.hourLabel ?? label ?? "";
  let valueText = "—";

  if (tab === "temp") {
    const tF = p?.temperatureF;
    if (typeof tF === "number") {
      valueText = unit === "mm" ? `${celsiusFromF(tF)}°C` : `${tF}°F`;
    }
  } else if (tab === "wind") {
    const mph = p?.windSpeedMph;
    if (typeof mph === "number") {
      valueText = unit === "mm" ? `${kphFromMph(mph)} kph` : `${mph} mph`;
    }
  } else if (tab === "precip") {
    const pct = p?.precipChancePct;
    if (typeof pct === "number") valueText = `${pct}%`;
  }

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 shadow-lg">
      <div className="text-slate-300">{hour}</div>
      <div className="font-semibold text-white">{valueText}</div>
      {p?.sky ? <div className="text-slate-300 mt-1">{p.sky}</div> : null}
      {p?.windDirText ? <div className="text-slate-300">{p.windDirText}</div> : null}
    </div>
  );
}

export default function CurrentConditions({
  locationId,
  unit = "in",
}: {
  locationId: string;
  unit?: Unit;
}) {
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("temp");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/current?locationId=${encodeURIComponent(locationId)}`)
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
  }, [locationId]);

  const current = resp?.currentData ?? null;

  const observedLabel = useMemo(() => {
    if (!current) return null;
    const t = formatObservedLabel(current.observedAt);
    if (!t) return null;
    const src = current.source === "observation" ? "Obs" : "Forecast";
    return `${src}: ${t}`;
  }, [current]);

  const chartData = useMemo(() => {
    const ts = resp?.timeseriesData ?? [];
    return ts
      .filter((p) => !!p.startTime)
      .map((p) => ({
        startTime: p.startTime!,
        hourLabel: p.hourLabel ?? "",
        temperatureF: p.temperatureF ?? null,
        precipChancePct: p.precipChancePct ?? null,
        windSpeedMph: p.wind?.speedMph ?? null,
        windDirText: p.wind?.directionText ?? null,
        sky: p.sky ?? null,
        skyCode: skyCode(p.sky),
      }));
  }, [resp]);

  const hasTimeseries = chartData.length > 0;

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

                  <div className="mt-3 flex items-center gap-4 text-sm text-slate-300">
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
                  </div>

                  {/* Optional status line */}
                  <div className="mt-3 text-xs text-slate-400">
                    {current.isObserved
                      ? current.isObservationStale
                        ? "Observation is stale — showing latest available."
                        : "Live observation."
                      : "Approximate (hourly forecast)."}
                  </div>
                </div>

                {/* Big icon */}
                <div className="flex flex-col items-end">
                  <SkyIcon sky={current.conditionText} className="h-10 w-10" />
                </div>
              </div>
            </div>

            {/* Tabs + Chart */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/10 p-4">
              <div className="flex flex-wrap gap-2">
                <TabButton
                  active={tab === "temp"}
                  onClick={() => setTab("temp")}
                  icon={<Thermometer className="h-4 w-4 text-red-400" />}
                  label="Temp"
                />
                <TabButton
                  active={tab === "precip"}
                  onClick={() => setTab("precip")}
                  icon={<Droplets className="h-4 w-4 text-sky-300" />}
                  label="Precip"
                />
                <TabButton
                  active={tab === "wind"}
                  onClick={() => setTab("wind")}
                  icon={<Wind className="h-4 w-4 text-sky-400" />}
                  label="Wind"
                />
              </div>

              <div className="mt-4 h-44">
                {!hasTimeseries ? (
                  <div className="text-sm text-slate-400">No timeseries data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                    >
                      {/* <CartesianGrid strokeDasharray="3 3" /> */}
                      <XAxis
                        dataKey="hourLabel"
                        interval="preserveStartEnd"
                        tickMargin={8}
                        minTickGap={16}
                      />
                      <YAxis
                        width={36}
                        tickMargin={8}
                        domain={
                          tab === "precip"
                            ? [0, 100]
                            : ["auto", "auto"]
                        }
                        tickFormatter={(v) => {
                          if (tab === "temp") {
                            return unit === "mm" ? `${celsiusFromF(v)}°` : `${v}°`;
                          }
                          if (tab === "wind") {
                            return unit === "mm" ? `${kphFromMph(v)}` : `${v}`;
                          }
                          if (tab === "precip") return `${v}%`;
                          return `${v}`;
                        }}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip unit={unit} tab={tab} />
                        }
                      />
                      {tab === "temp" ? (
                        <Line
                          type="monotone"
                          dataKey="temperatureF"
                          dot={false}
                          strokeWidth={2}
                          connectNulls
                        />
                      ) : null}
                      {tab === "wind" ? (
                        <Line
                          type="monotone"
                          dataKey="windSpeedMph"
                          dot={false}
                          strokeWidth={2}
                          connectNulls
                        />
                      ) : null}
                      {tab === "precip" ? (
                        <Line
                          type="monotone"
                          dataKey="precipChancePct"
                          dot={false}
                          strokeWidth={2}
                          connectNulls
                        />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Mini timeline row (icons) */}
              {hasTimeseries ? (
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {chartData.slice(0, 6).map((p) => (
                    <div
                      key={p.startTime}
                      className="rounded-xl border border-slate-700/60 bg-slate-900/10 p-2 text-center"
                    >
                      <div className="text-[10px] text-slate-400">{p.hourLabel}</div>
                      <div className="mt-1 flex justify-center">
                        <SkyIcon sky={p.sky} className="h-4 w-4 text-slate-200" />
                      </div>
                      <div className="mt-1 text-xs text-slate-200 font-medium">
                        {tab === "temp" ? (
                          p.temperatureF == null ? (
                            "—"
                          ) : unit === "mm" ? (
                            `${celsiusFromF(p.temperatureF)}°`
                          ) : (
                            `${p.temperatureF}°`
                          )
                        ) : tab === "wind" ? (
                          p.windSpeedMph == null ? (
                            "—"
                          ) : unit === "mm" ? (
                            `${kphFromMph(p.windSpeedMph)}`
                          ) : (
                            `${p.windSpeedMph}`
                          )
                        ) : (
                          p.precipChancePct == null ? "—" : `${p.precipChancePct}%`
                        )}
                      </div>
                      {tab === "wind" && p.windDirText ? (
                        <div className="text-[10px] text-slate-400">{p.windDirText}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* (Optional) Sky as a tiny legend */}
              {hasTimeseries ? (
                <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                  <CloudSun className="h-3.5 w-3.5" />
                  <span>Hourly forecast (next ~24h)</span>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
