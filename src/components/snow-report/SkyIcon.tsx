import { Sun, Cloud, CloudSun, Cloudy, CloudSnow } from "lucide-react";

export function SkyIcon({ sky, className }: { sky?: string | null; className?: string }) {
  const s = (sky ?? "").trim().toLowerCase();
  const withDefaultClass = (defaults: string) =>
    className ? `${defaults} ${className}` : defaults;

  if (!s) return <Cloud className={withDefaultClass("h-4 w-4 text-slate-300")} />;
  if (s === "clear" || s === "sunny" || s === "fair") {
    return <Sun className={withDefaultClass("h-4 w-4 text-yellow-400")} />;
  }
  if (
    s === "mostly clear" ||
    s === "mostly sunny" ||
    s === "partly sunny" ||
    s === "partly cloudy"
  ) {
    return <CloudSun className={withDefaultClass("h-4 w-4 text-yellow-300")} />;
  }
  if (s === "mostly cloudy" || s === "cloudy") {
    return <Cloud className={withDefaultClass("h-4 w-4 text-slate-300")} />;
  }
  if (s === "overcast") return <Cloudy className={withDefaultClass("h-4 w-4 text-slate-400")} />;
  if (s.includes("snow") || s.includes("sleet")) {
    return <CloudSnow className={withDefaultClass("h-4 w-4 text-slate-300")} />;
  }
  if (s.includes("sunny")) return <CloudSun className={withDefaultClass("h-4 w-4 text-yellow-300")} />;
  if (s.includes("clear")) return <Sun className={withDefaultClass("h-4 w-4 text-yellow-400")} />;
  if (s.includes("cloud")) return <Cloud className={withDefaultClass("h-4 w-4 text-slate-300")} />;
  return <Cloud className={withDefaultClass("h-4 w-4 text-slate-300")} />;
}
