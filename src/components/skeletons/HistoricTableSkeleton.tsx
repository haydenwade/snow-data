export default function HistoricTableSkeleton() {
  const headerCellClasses = [
    "text-left font-medium py-2 pl-4",
    "text-right font-medium py-2",
    "text-right font-medium py-2 pr-4",
  ];

  const bodyCellClasses = [
    "py-2 pl-4",
    "py-2 text-right",
    "py-2 pr-4 text-right",
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-700/30 rounded" />
          <div className="h-5 w-32 bg-slate-700/30 rounded" />
        </div>
      </div>
      <div className="p-0">
        <div className="overflow-x-auto overflow-y-auto h-100">
          <table className="min-w-full text-sm table-fixed">
            <thead className="sticky top-0 z-10 bg-slate-800/70 backdrop-blur-sm">
              <tr>
                {headerCellClasses.map((className, i) => (
                  <th key={className} className={className}>
                    <div
                      className={`h-4 w-20 bg-slate-700/30 rounded ${
                        i === 0 ? "" : "ml-auto"
                      }`}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="border-t border-slate-700/30">
                  {bodyCellClasses.map((className, j) => (
                    <td key={`${className}-${j}`} className={className}>
                      <div
                        className={`h-4 w-16 bg-slate-700/30 rounded ${
                          j === 0 ? "" : "ml-auto"
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
