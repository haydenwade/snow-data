import Link from "next/link";
import { ArrowRight, Layers, Mountain, Satellite, Snowflake, ThermometerSnowflake } from "lucide-react";

const NEW_FEATURES = [
  {
    icon: Satellite,
    title: "Satellite snow cover",
    body: "Dated NASA imagery on the map, plus a 30-day scrubber and a jump to the latest clear 30 m view.",
  },
  {
    icon: Layers,
    title: "Snow depth anywhere",
    body: "Tap any spot on the map for NOAA's modeled depth, not just where there's a station.",
  },
  {
    icon: Mountain,
    title: "Snowpack by elevation",
    body: "See how high you need to go: nearby station depths plotted by elevation on every station page.",
  },
  {
    icon: ThermometerSnowflake,
    title: "Snow level forecasts",
    body: "Daily snow level in the forecast, with a heads-up when rain may reach the station.",
  },
];

export default function SeasonBanner() {
  return (
    <section
      aria-labelledby="season-banner-title"
      className="mb-8 rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-500/10 via-slate-800/60 to-indigo-500/10 px-4 py-5 md:px-6 md:py-6 text-left"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-lg bg-sky-400/15 p-2 text-sky-300">
          <Snowflake className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-4">
          <div>
            <h2
              id="season-banner-title"
              className="text-lg md:text-xl font-semibold text-sky-50"
            >
              The first snow of the season has fallen
            </h2>
            <p className="mt-1 text-sm md:text-base text-slate-300">
              Season two is here. Early season is when coverage is hardest to
              read, so this year SNOWD shows what&apos;s happening between the
              stations too. Still free, still ad-free.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {NEW_FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex items-start gap-2.5 rounded-lg border border-slate-700/70 bg-slate-900/50 p-3"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                <div className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-100">{title}.</span>{" "}
                  {body}
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/map?sat=snow-cover"
            className="inline-flex items-center gap-2 rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            See snow cover on the map
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
