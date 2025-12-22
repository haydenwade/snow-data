export default function ForecastTableSkeleton() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-700/30 rounded" />
          <div className="h-5 w-32 bg-slate-700/30 rounded" />
        </div>
      </div>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-max text-sm">
            <thead className="sticky top-0 z-10 bg-slate-800/70 backdrop-blur-sm">
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="py-2">
                    <div className="h-4 w-20 bg-slate-700/30 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(7)].map((_, i) => (
                <tr key={i} className="border-t border-slate-700/30 animate-pulse">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="py-2">
                      <div className="h-4 w-16 bg-slate-700/30 rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
