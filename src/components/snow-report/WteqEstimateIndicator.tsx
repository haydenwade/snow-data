import { FlaskConical } from "lucide-react";

type TooltipAlign = "center" | "right";

export default function WteqEstimateIndicator({
  tooltipAlign = "center",
}: {
  tooltipAlign?: TooltipAlign;
}) {
  const tooltipPositionClass =
    tooltipAlign === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <div className="relative group inline-flex items-center">
      <FlaskConical
        className="h-3.5 w-3.5 text-amber-400"
        aria-label="Estimated from Snow Water Equivalent (SWE)"
      />
      <div
        className={`pointer-events-none absolute top-full mt-1 hidden whitespace-nowrap rounded border border-slate-700/50 bg-slate-800/95 px-2 py-1 text-[10px] text-slate-200 shadow-lg group-hover:block group-focus-within:block z-20 ${tooltipPositionClass}`}
      >
        Estimated from Snow Water Equivalent (SWE)
      </div>
    </div>
  );
}
