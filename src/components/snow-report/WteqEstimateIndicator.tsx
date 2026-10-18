"use client";
import { useEffect, useRef, useState } from "react";
import { FlaskConical } from "lucide-react";

type TooltipAlign = "center" | "right";

const LABEL = "Estimated from Snow Water Equivalent (SWE)";

export default function WteqEstimateIndicator({
  tooltipAlign = "center",
}: {
  tooltipAlign?: TooltipAlign;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on tap/click outside so mobile users can dismiss it
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const tooltipPositionClass =
    tooltipAlign === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <div ref={containerRef} className="relative group inline-flex items-center">
      <button
        type="button"
        aria-label={LABEL}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center rounded p-0.5 -m-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
      >
        <FlaskConical className="h-3.5 w-3.5 text-amber-400" />
      </button>
      <div
        role="tooltip"
        className={`pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded border border-slate-700/50 bg-slate-800/95 px-2 py-1 text-[10px] text-slate-200 shadow-lg group-hover:block z-20 ${tooltipPositionClass} ${open ? "block" : "hidden"}`}
      >
        {LABEL}
      </div>
    </div>
  );
}
