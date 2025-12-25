import { ApiResp } from "@/types/current-conditions-response";
import { CloudSun, Droplets, LineChart, Thermometer, Wind } from "lucide-react";
import { useMemo, useState } from "react";
import { Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { celsiusFromF, kphFromMph } from "./utils";
import { SkyIcon } from "./SkyIcon";
import { Unit } from "@/types/forecast";

type TabKey = "temp" | "wind" | "precip";

//TODO: move this function to utils file
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

//TODO: check if this is duplicated and clean up dupes
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
      {p?.windDirText ? (
        <div className="text-slate-300">{p.windDirText}</div>
      ) : null}
    </div>
  );
}

//TODO: rename prop
export default function CurrentConditionsChart({
  resp,
}: {
  resp: ApiResp | null;
}) {
  const [tab, setTab] = useState<TabKey>("temp");

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

  return (
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
                domain={tab === "precip" ? [0, 100] : ["auto", "auto"]}
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
              <Tooltip content={<ChartTooltip unit={unit} tab={tab} />} />
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
                {tab === "temp"
                  ? p.temperatureF == null
                    ? "—"
                    : unit === "mm"
                    ? `${celsiusFromF(p.temperatureF)}°`
                    : `${p.temperatureF}°`
                  : tab === "wind"
                  ? p.windSpeedMph == null
                    ? "—"
                    : unit === "mm"
                    ? `${kphFromMph(p.windSpeedMph)}`
                    : `${p.windSpeedMph}`
                  : p.precipChancePct == null
                  ? "—"
                  : `${p.precipChancePct}%`}
              </div>
              {tab === "wind" && p.windDirText ? (
                <div className="text-[10px] text-slate-400">
                  {p.windDirText}
                </div>
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
  );
}
