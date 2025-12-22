export default function SnowSummaryStripSkeleton() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
        <div className="h-5 w-5 bg-slate-700/30 rounded" />
        <div className="h-5 w-32 bg-slate-700/30 rounded" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="flex-1 min-w-[120px] rounded-xl p-3 bg-slate-700/30 border border-slate-600/30 animate-pulse"
          >
            <div className="h-3 w-20 bg-slate-700/30 rounded mb-2" />
            <div className="flex items-end gap-0.5 h-10 mb-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-slate-600/50 rounded-t"
                  style={{ minHeight: "2px", height: `${20 + i * 10}%` }}
                />
              ))}
            </div>
            <div className="h-6 w-16 bg-slate-700/30 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <div className="h-6 w-32 bg-slate-700/30 rounded" />
      </div>
    </div>
  );
}
