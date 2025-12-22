export default function CurrentConditionsSkeleton() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-700/30 rounded" />
          <div className="h-5 w-32 bg-slate-700/30 rounded" />
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-baseline gap-3">
            <div className="h-10 w-24 bg-slate-700/30 rounded" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700/30 rounded-full" />
              <div>
                <div className="h-3 w-10 bg-slate-700/30 rounded mb-1" />
                <div className="h-4 w-16 bg-slate-700/30 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700/30 rounded-full" />
              <div>
                <div className="h-3 w-10 bg-slate-700/30 rounded mb-1" />
                <div className="h-4 w-24 bg-slate-700/30 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
