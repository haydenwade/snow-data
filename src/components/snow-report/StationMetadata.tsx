"use client";

export default function StationMetadata() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
      <div className="bg-slate-800/60 rounded p-2">Station ID: 1308</div>
      <div className="bg-slate-800/60 rounded p-2">Network: SNOTEL</div>
      <div className="bg-slate-800/60 rounded p-2">County: Salt Lake</div>
      <div className="bg-slate-800/60 rounded p-2">HUC: 160202040202</div>
    </div>
  );
}
