import { ArrowRight, Snowflake, Sun } from "lucide-react";

export default function SummerBanner() {
  return (
    <section
      aria-labelledby="summer-banner-title"
      className="mb-8 rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-slate-800/60 to-sky-500/10 px-4 py-5 md:px-6 md:py-6 text-left"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-lg bg-amber-400/15 p-2 text-amber-300">
          <Sun className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-3">
          <div>
            <h2
              id="summer-banner-title"
              className="text-lg md:text-xl font-semibold text-amber-50"
            >
              Thank you for an incredible first season
            </h2>
            <p className="mt-1 text-sm md:text-base text-slate-300">
              To everyone who used SNOWD, sent feedback, reported a bad data
              point, or asked for their home mountain — thank you. Every bit of
              it shaped the app. SNOWD is still free, still ad-free, and still
              here all summer if you want to look back at the season.
            </p>
          </div>

          <div className="flex items-start gap-2 text-sm md:text-base text-slate-300">
            <Snowflake
              className="mt-1 h-4 w-4 shrink-0 text-sky-300"
              aria-hidden="true"
            />
            <p>
              <span className="font-semibold text-slate-100">
                Next season is going to be a big one.
              </span>{" "}
              More resorts are being added, and a few new features are in the
              works. Check back before the first storm.
            </p>
          </div>

          <div className="rounded-lg border border-slate-700/70 bg-slate-900/50 p-4">
            <p className="text-sm md:text-base text-slate-300">
              In the meantime, I built something for the warm months:{" "}
              <span className="font-semibold text-slate-100">Detour</span> —
              ready-made day trips to the towns worth the drive. Every stop
              sequenced and timed, so you never have to ask what&apos;s next.
              Free to unlock.
            </p>
            <a
              href="https://detour.teamwawe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Take the detour
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
