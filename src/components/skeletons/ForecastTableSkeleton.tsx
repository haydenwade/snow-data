export default function ForecastTableSkeleton() {
  const headerCellClasses = [
    "text-left font-medium py-2 pl-4 w-36 whitespace-nowrap",
    "text-right font-medium py-2 w-32 whitespace-nowrap",
    "text-right font-medium py-2 w-24 whitespace-nowrap",
    "text-right font-medium py-2 pr-4 w-36 whitespace-nowrap",
    "text-center font-medium py-2 w-40 whitespace-nowrap",
    "text-center font-medium py-2 w-36 whitespace-nowrap",
  ];

  const bodyCellClasses = [
    "py-2 pl-4 w-36",
    "py-2 text-right w-32 whitespace-nowrap",
    "py-2 text-right w-24 whitespace-nowrap",
    "py-2 pr-4 text-right w-36 whitespace-nowrap",
    "py-2 text-center w-40 whitespace-nowrap",
    "py-2 text-center w-36 whitespace-nowrap",
  ];

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
                {headerCellClasses.map((className, i) => (
                  <th key={className} className={className}>
                    <div
                      className={`h-4 w-20 bg-slate-700/30 rounded ${
                        i === 0 ? "" : i <= 3 ? "ml-auto" : "mx-auto"
                      }`}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(7)].map((_, i) => (
                <tr key={i} className="border-t border-slate-700/30 animate-pulse">
                  {bodyCellClasses.map((className, j) => (
                    <td key={`${className}-${j}`} className={className}>
                      <div
                        className={`h-4 w-16 bg-slate-700/30 rounded ${
                          j === 0 ? "" : j <= 3 ? "ml-auto" : "mx-auto"
                        }`}
                      />
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
