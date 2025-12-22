import { Cloud, Wind } from "lucide-react";

export default function ForecastTimelineSkeleton() {
  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-700/30 rounded" />
          <div className="h-5 w-32 bg-slate-700/30 rounded" />
        </div>
      </div>
      <div className="p-3 overflow-x-auto">
        <div className="flex gap-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 bg-slate-800/20 rounded-md p-3 flex flex-col items-start gap-2"
            >
              <div className="w-full">
                <div className="h-4 w-24 bg-slate-700/30 rounded mb-2" />
              </div>
              <div className="w-full flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-700/30">
                  <Cloud className="h-6 w-6 text-slate-300 opacity-30" />
                </div>
                <div className="flex-1">
                  <div className="h-4 w-20 bg-slate-700/30 rounded" />
                </div>
              </div>
              <div className="w-full flex items-center justify-between">
                <div className="h-4 w-10 bg-slate-700/30 rounded" />
                <div className="h-4 w-10 bg-slate-700/30 rounded" />
              </div>
              <div className="w-full flex items-center justify-between text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-slate-300 opacity-30" />
                  <div className="h-4 w-12 bg-slate-700/30 rounded" />
                </div>
                <div className="h-3 w-8 bg-slate-700/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
