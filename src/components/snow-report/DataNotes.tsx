"use client";

export default function DataNotes() {
  return (
    <section className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-4 text-xs text-slate-400 leading-relaxed">
      <h4 className="font-semibold mb-2">Data Notes</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>WTEQ = Snow Water Equivalent (inches). SNWD = Snow depth (inches). Source: SNOTEL Station 1308.</li>
        <li>Daily snowfall is derived from daily changes in SNWD; if SNWD is flat but SWE increases, snowfall = SWE increase × 12 (assumed 12:1 snow-to-liquid). Labeled as derived.</li>
        <li>NWS snowfallAmount is provided in millimeters over varying time windows. We convert mm → inches (divide by 25.4), then allocate period values hourly and sum by calendar day in America/Denver.</li>
        <li>Daily PoP shown is the maximum Probability of Precipitation for that day. Temperature shown is min/max °F from hourly temperature series.</li>
      </ul>
    </section>
  );
}
