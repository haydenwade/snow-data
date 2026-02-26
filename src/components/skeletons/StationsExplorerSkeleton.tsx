export default function StationsExplorerSkeleton() {
  const stationMarkers = [
    { left: "14%", top: "28%" },
    { left: "25%", top: "36%" },
    { left: "34%", top: "24%" },
    { left: "43%", top: "42%" },
    { left: "56%", top: "30%" },
    { left: "64%", top: "46%" },
    { left: "74%", top: "34%" },
    { left: "82%", top: "54%" },
  ];
  const clusterMarkers = [
    { left: "48%", top: "22%", size: "h-8 w-8" },
    { left: "69%", top: "63%", size: "h-9 w-9" },
  ];

  return (
    <div
      aria-hidden="true"
      className="h-full w-full animate-pulse rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm overflow-hidden"
    >
      <div className="min-h-[60px] border-b border-slate-700/70 bg-slate-900/95 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-slate-700/30" />
            <div className="h-5 w-44 rounded bg-slate-700/30" />
            <div className="h-3 w-20 rounded bg-slate-700/20" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-48 rounded-lg border border-slate-700/60 bg-slate-700/15" />
            <div className="h-9 w-9 rounded-lg border border-slate-700/60 bg-slate-700/15" />
            <div className="h-9 w-20 rounded-lg border border-slate-700/60 bg-slate-700/15" />
          </div>
        </div>
      </div>

      <div className="relative h-[600px] w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.08),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.05),transparent_42%),linear-gradient(to_bottom,rgba(15,23,42,0.96),rgba(2,6,23,0.98))]" />

        <div className="absolute inset-0 opacity-35">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(51,65,85,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.12)_1px,transparent_1px)] bg-[size:30px_30px]" />
        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <g fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="0.5">
            <path d="M-5 14 C 10 18, 20 8, 36 14 S 65 24, 105 10" />
            <path d="M-5 26 C 12 32, 20 18, 36 24 S 65 34, 105 22" />
            <path d="M-5 38 C 10 44, 22 32, 38 38 S 66 48, 105 35" />
            <path d="M-5 52 C 10 58, 22 46, 38 52 S 66 62, 105 49" />
            <path d="M-5 66 C 12 72, 22 60, 40 66 S 70 76, 105 63" />
            <path d="M-5 80 C 12 86, 26 74, 42 80 S 72 90, 105 77" />
          </g>

          <g fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="0.8" strokeLinecap="round">
            <path d="M12 88 C 22 72, 27 56, 35 44 S 52 28, 64 18" />
            <path d="M36 90 C 44 72, 52 58, 62 46 S 76 30, 86 12" />
          </g>

          <g fill="none" stroke="rgba(59,130,246,0.28)" strokeWidth="1.1" strokeLinecap="round">
            <path d="M6 20 C 18 26, 24 36, 32 44 S 50 60, 62 68 S 80 84, 96 86" />
          </g>

          <g>
            <path
              d="M22 24 L34 19 L42 27 L38 37 L26 40 L19 32 Z"
              fill="rgba(251,191,36,0.08)"
              stroke="rgba(245,158,11,0.22)"
              strokeWidth="0.7"
            />
            <path
              d="M54 29 L67 24 L76 33 L72 44 L58 46 L50 38 Z"
              fill="rgba(34,197,94,0.08)"
              stroke="rgba(74,222,128,0.22)"
              strokeWidth="0.7"
            />
            <path
              d="M40 52 L56 47 L66 57 L62 72 L45 74 L36 62 Z"
              fill="rgba(96,165,250,0.07)"
              stroke="rgba(96,165,250,0.2)"
              strokeWidth="0.7"
            />
            <path
              d="M72 55 L85 51 L92 60 L89 71 L77 74 L69 66 Z"
              fill="rgba(239,68,68,0.06)"
              stroke="rgba(248,113,113,0.2)"
              strokeWidth="0.7"
            />
          </g>
        </svg>

        <div className="absolute left-3 top-3 h-8 w-40 rounded-lg border border-slate-700/60 bg-slate-800/70 sm:left-4 sm:top-4 sm:h-9 sm:w-52" />
        <div className="absolute left-3 top-14 h-6 w-28 rounded-md border border-slate-700/50 bg-slate-800/60 sm:left-4 sm:top-16 sm:w-36" />

        {stationMarkers.map((marker) => (
          <div
            key={`${marker.left}-${marker.top}`}
            className="absolute -translate-x-1/2 -translate-y-[80%]"
            style={{ left: marker.left, top: marker.top }}
          >
            <div className="h-6 w-6 rounded-full border border-slate-500/70 bg-black/80 shadow-lg" />
            <div className="mx-auto -mt-1 h-2.5 w-2.5 rotate-45 rounded-[2px] border-r border-b border-slate-500/60 bg-black/80" />
          </div>
        ))}

        {clusterMarkers.map((cluster) => (
          <div
            key={`${cluster.left}-${cluster.top}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-400/70 bg-black/85 shadow-lg"
            style={{ left: cluster.left, top: cluster.top }}
          >
            <div className={`${cluster.size} rounded-full bg-slate-700/25`} />
          </div>
        ))}

        <div className="absolute right-3 top-20 flex flex-col gap-2 sm:right-4 sm:top-24">
          <div className="h-12 w-12 rounded-xl border border-slate-700/60 bg-slate-800/70" />
          <div className="h-12 w-12 rounded-xl border border-slate-700/60 bg-slate-800/70" />
        </div>

        <div className="absolute bottom-4 left-1/2 h-9 w-44 -translate-x-1/2 rounded-lg border border-slate-700/60 bg-slate-800/75 sm:w-56" />
        <div className="absolute bottom-4 left-4 h-12 w-12 rounded-full border border-slate-700/60 bg-slate-800/80" />
      </div>
    </div>
  );
}
