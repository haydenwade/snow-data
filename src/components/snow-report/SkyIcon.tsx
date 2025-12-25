import { Sun, Cloud, CloudSun, Cloudy, CloudSnow } from "lucide-react";

export function SkyIcon({ sky, className }: { sky?: string | null; className?: string }) {
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