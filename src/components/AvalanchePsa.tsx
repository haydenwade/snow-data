const PSA_POSTED_AT = {
  iso: "2026-02-26T08:00:00-07:00",
  label: "Feb 26, 2026 · 8:00 AM MT",
};

export default function AvalanchePsa() {
  return (
    <details className="mb-5 max-w-4xl mx-auto rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 md:px-5 md:py-4 text-left">
      <summary className="cursor-pointer list-none [&::marker]:hidden [&::-webkit-details-marker]:hidden">
        <div className="flex items-start gap-2.5">
          <span className="self-center text-lg leading-none" aria-hidden="true">
            ⚠️
          </span>
          <div className="min-w-0">
            <p className="text-sm md:text-base font-semibold text-amber-100">
              Avalanche Fatalities Are Rising
            </p>
            <p className="text-[11px] md:text-xs text-amber-200/80">
              Posted{" "}
              <time dateTime={PSA_POSTED_AT.iso}>{PSA_POSTED_AT.label}</time>
            </p>
            <p className="text-xs md:text-sm text-amber-50/90">
              <span className="font-semibold text-amber-100">
                16 people have died in avalanches this season.
              </span>{" "}
              Tap to expand the safety PSA.
            </p>
          </div>
          <span className="ml-auto shrink-0 text-[11px] md:text-xs text-amber-200/80">
            Expand
          </span>
        </div>
      </summary>
      <div className="mt-3 border-t border-amber-300/20 pt-3 pl-7 space-y-2">
        <p className="text-xs md:text-sm text-amber-50/90">
          There has been a sharp increase in avalanche fatalities and burials
          over the past week.
        </p>
        <p className="text-xs md:text-sm text-amber-50/90">
          High danger means large, deadly avalanches are likely — even from
          below steep terrain.
        </p>
        <p className="text-xs md:text-sm text-amber-50/90">
          If you have to think twice, stay home. No line, no summit, no powder
          turn is worth your life.
        </p>
        <p className="text-xs md:text-sm text-amber-50/90">
          Check the forecast. Carry the gear. Travel with training. Or choose
          safer terrain.
          <span className="font-semibold text-amber-100">
            {" "}
            Stay smart. Come home.
          </span>
        </p>
      </div>
    </details>
  );
}
