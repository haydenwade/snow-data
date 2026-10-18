"use client";

import { ReactNode } from "react";

type MapLayerSwitchProps = {
  label: string;
  detail?: string;
  checked: boolean;
  dotClassName: string;
  onToggle: () => void;
  children?: ReactNode;
};

/** One row of the map's Layers menu: a labelled on/off switch with optional sub-options. */
export default function MapLayerSwitch({
  label,
  detail,
  checked,
  dotClassName,
  onToggle,
  children,
}: MapLayerSwitchProps) {
  return (
    <div className="mt-1">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-slate-800/80"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span
            className={["h-2 w-2 rounded-full", checked ? dotClassName : "bg-slate-500"].join(" ")}
            aria-hidden="true"
          />
          <span className="flex flex-col">
            <span className="text-xs font-medium text-slate-100">{label}</span>
            {detail ? <span className="text-[10px] text-slate-400">{detail}</span> : null}
          </span>
        </div>
        <span
          className={[
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition",
            checked ? "border-sky-400/60 bg-sky-500/20" : "border-slate-600 bg-slate-800",
          ].join(" ")}
          aria-hidden="true"
        >
          <span
            className={[
              "inline-block h-3.5 w-3.5 rounded-full transition",
              checked ? `translate-x-4 ${dotClassName}` : "translate-x-0.5 bg-slate-400",
            ].join(" ")}
          />
        </span>
      </button>
      {checked && children ? <div className="px-2 pb-1">{children}</div> : null}
    </div>
  );
}
