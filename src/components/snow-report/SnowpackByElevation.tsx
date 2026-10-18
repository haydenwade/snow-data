"use client";

import { useEffect, useState } from "react";
import { Mountain } from "lucide-react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Unit } from "@/types/forecast";
import { SnowpackProfileResponse, SnowpackProfileStation } from "@/types/imagery";
import { formatElevationForUnit, inchesToCm, metersFromFeet } from "./utils";

const SNOW_ON_GROUND_IN = 1;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SnowpackProfileResponse };

function summarize(stations: SnowpackProfileStation[], unit: Unit) {
  const withSnow = stations.filter((s) => s.snowDepthIn >= SNOW_ON_GROUND_IN);
  const bare = stations.filter((s) => s.snowDepthIn < SNOW_ON_GROUND_IN);
  if (withSnow.length === 0) return "No nearby station reports snow on the ground.";
  const lowestSnow = withSnow.reduce((a, b) => (b.elevationFt < a.elevationFt ? b : a));
  if (bare.length === 0) {
    return `All ${stations.length} nearby stations report snow, lowest at ${formatElevationForUnit(lowestSnow.elevationFt, unit)}.`;
  }
  const highestBare = bare.reduce((a, b) => (b.elevationFt > a.elevationFt ? b : a));
  if (highestBare.elevationFt > lowestSnow.elevationFt) {
    return `Patchy: ${withSnow.length} of ${stations.length} nearby stations report snow, lowest at ${formatElevationForUnit(lowestSnow.elevationFt, unit)}. Some higher stations are still bare.`;
  }
  const depth =
    unit === "mm"
      ? `${Math.round(inchesToCm(lowestSnow.snowDepthIn))} cm`
      : `${Math.round(lowestSnow.snowDepthIn)}"`;
  return `Lowest station with snow: ${formatElevationForUnit(lowestSnow.elevationFt, unit)} (${depth}). Highest bare station: ${formatElevationForUnit(highestBare.elevationFt, unit)}.`;
}

export default function SnowpackByElevation({ stationKey, unit }: { stationKey: string; unit: Unit }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const abortController = new AbortController();
    fetch(`/api/stations/${encodeURIComponent(stationKey)}/snowpack-profile`, {
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Snowpack profile failed (${response.status})`);
        return (await response.json()) as SnowpackProfileResponse;
      })
      .then((data) => setState({ status: "ready", data }))
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        setState({ status: "error", message: "Couldn't load nearby station snow depths." });
      });
    return () => abortController.abort();
  }, [stationKey]);

  const metric = unit === "mm";
  const stations = state.status === "ready" ? state.data.stations : [];
  const chartData = stations.map((s) => ({
    ...s,
    depth: metric ? Math.round(inchesToCm(s.snowDepthIn)) : s.snowDepthIn,
    elevation: metric ? metersFromFeet(s.elevationFt) : s.elevationFt,
  }));
  const depthUnit = metric ? "cm" : '"';
  const elevationUnit = metric ? "m" : "ft";
  const observedDate = stations.find((s) => s.isCurrentStation)?.observedDate ?? stations[0]?.observedDate;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/50">
        <Mountain className="h-5 w-5 text-sky-400" />
        <h2 className="font-semibold text-white">Snowpack by Elevation</h2>
      </div>

      {state.status === "loading" ? (
        <div className="h-64 animate-pulse rounded-lg bg-slate-700/30" />
      ) : null}

      {state.status === "error" ? <p className="text-sm text-red-400">{state.message}</p> : null}

      {state.status === "ready" && stations.length < 2 ? (
        <p className="text-sm text-slate-300">
          Not enough nearby SNOTEL stations reporting for an elevation profile.
        </p>
      ) : null}

      {state.status === "ready" && stations.length >= 2 ? (
        <>
          <p className="text-sm text-slate-200">{summarize(stations, unit)}</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="depth"
                  name="Depth"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}${depthUnit}`}
                />
                <YAxis
                  type="number"
                  dataKey="elevation"
                  name="Elevation"
                  domain={["dataMin - 300", "dataMax + 300"]}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={false}
                  width={56}
                  tickFormatter={(v: number) => `${Math.round(v).toLocaleString("en-US")}`}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    const item = active ? payload?.[0]?.payload : null;
                    if (!item) return null;
                    return (
                      <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-xl text-xs">
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-slate-300">
                          {item.elevation.toLocaleString("en-US")} {elevationUnit} · {item.depth}
                          {depthUnit}
                        </p>
                        <p className="text-slate-400">
                          {item.isCurrentStation ? "This station" : `${item.distanceMiles} mi away`}
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter data={chartData}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={entry.isCurrentStation ? "#f97316" : "#38bdf8"}
                      stroke={entry.isCurrentStation ? "#fed7aa" : "none"}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Measured · SNOTEL · {stations.length} stations within {state.data.radiusMiles} mi
            {observedDate ? ` · ${observedDate}` : ""}. Elevation in {elevationUnit}; orange is this
            station.
          </p>
        </>
      ) : null}
    </div>
  );
}
