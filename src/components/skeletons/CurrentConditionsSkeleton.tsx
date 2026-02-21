export default function CurrentConditionsSkeleton() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-700/30 rounded" />
          <div className="h-5 w-32 bg-slate-700/30 rounded" />
          <div className="h-3 w-24 bg-slate-700/20 rounded ml-3" />
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/20 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="h-3 w-8 bg-slate-700/30 rounded" />
                <div className="mt-2 h-10 w-28 bg-slate-700/30 rounded" />

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-slate-700/30 rounded-full" />
                      <div className="min-w-0">
                        <div className="h-3 w-10 bg-slate-700/30 rounded mb-1" />
                        <div className="h-4 w-20 bg-slate-700/30 rounded" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 h-3 w-64 max-w-full bg-slate-700/25 rounded" />
              </div>

              <div className="flex flex-col items-end">
                <div className="h-20 w-20 bg-slate-700/25 rounded-full" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/10 p-4">
            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-24 rounded-xl border border-slate-700/60 bg-slate-700/20"
                />
              ))}
            </div>

            <div className="mt-4 h-44 rounded-xl border border-slate-700/40 bg-slate-900/20 p-3">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-px w-full bg-slate-700/25" />
                  ))}
                </div>
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  <polyline
                    points="0,72 12,68 24,63 36,66 48,58 60,61 72,53 84,56 100,48"
                    fill="none"
                    stroke="rgba(148,163,184,0.55)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-700/60 bg-slate-900/10 p-2"
                >
                  <div className="h-2.5 w-8 bg-slate-700/25 rounded mx-auto" />
                  <div className="h-4 w-4 bg-slate-700/25 rounded-full mx-auto mt-2" />
                  <div className="h-3 w-8 bg-slate-700/25 rounded mx-auto mt-2" />
                </div>
              ))}
            </div>

            <div className="mt-3 h-3 w-36 bg-slate-700/25 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
