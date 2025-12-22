export default function HistoricChartSkeleton() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 animate-pulse">
      <div className="h-6 w-40 bg-slate-700 mb-4 rounded" />
      <div className="h-64 w-full flex items-end gap-2 px-4 pb-4 bg-slate-800/0">
        {[30, 80, 50, 100, 60, 40, 90, 70, 20, 60, 40, 80, 30, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-orange-400/40 rounded-t"
            style={{ height: `${h}%`, minHeight: 10 }}
          />
        ))}
      </div>
    </div>
  );
}
