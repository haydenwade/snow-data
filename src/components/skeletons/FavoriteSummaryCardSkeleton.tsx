export default function FavoriteSummaryCardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-700/50" />
          <div>
            <div className="h-5 w-36 bg-slate-700/50 rounded mb-1" />
            <div className="h-3 w-24 bg-slate-700/50 rounded" />
          </div>
        </div>
        <div className="h-6 w-6 bg-slate-700/50 rounded" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-3 w-full bg-slate-700/50 rounded mb-2 mx-auto" />
            <div className="h-8 w-12 bg-slate-700/50 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
