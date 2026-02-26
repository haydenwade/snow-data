import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BookOpen,
  Cloud,
  Database,
  ExternalLink,
  Info,
  Mountain,
} from "lucide-react";

type KnowledgeResource = {
  title: string;
  description: string;
  href: string;
  source: string;
};

type KnowledgeSection = {
  title: string;
  description?: string;
  bullets: string[];
};

const AVALANCHE_RESOURCES: KnowledgeResource[] = [
  {
    title: "Avalanche Danger Scale",
    description:
      "Utah Avalanche Center overview explaining avalanche danger ratings and how to interpret the scale.",
    href: "https://utahavalanchecenter.org/avalanche-danger-scale",
    source: "Utah Avalanche Center (UAC)",
  },
  {
    title: "How to Read an Avalanche Forecast",
    description:
      "UAC tutorial for understanding forecast structure, avalanche problems, and travel advice.",
    href: "https://utahavalanchecenter.org/forecast/tutorial",
    source: "Utah Avalanche Center (UAC)",
  },
  {
    title: "Danger Rose and Location Rose Tutorial",
    description:
      "UAC tutorial explaining the danger rose and location rose used in avalanche forecasts.",
    href: "https://utahavalanchecenter.org/danger-rose-and-location-rose-tutorial",
    source: "Utah Avalanche Center (UAC)",
  },
];

const PRODUCT_EXPLAINERS: KnowledgeSection[] = [
  {
    title: "Station Data vs Avalanche Forecasts",
    description:
      "SNOWD combines point measurements with regional avalanche information. They answer different questions.",
    bullets: [
      "SNOTEL and weather stations are point observations at one location and elevation.",
      "Avalanche danger ratings are regional forecasts that vary by elevation band, aspect, and terrain.",
      "A station near your objective can be useful context, but it is not a substitute for the avalanche forecast for your terrain.",
    ],
  },
  {
    title: "Why SNOWD Sometimes Shows Nearby Avalanche Regions",
    description:
      "Some stations are outside an official avalanche forecast region.",
    bullets: [
      "When a station is outside a forecast area, SNOWD shows nearby forecast regions to give you context.",
      "Nearby regions help you find the right avalanche center and forecast page quickly.",
      "Do not assume nearby region danger ratings directly apply to your location without checking the official forecast area boundaries and terrain details.",
    ],
  },
];

const METHODOLOGY_SECTIONS: KnowledgeSection[] = [
  {
    title: "Station Snowfall: How To Interpret Derived Daily Snow",
    description:
      "SNOWD shows a consistent station-based snowfall estimate, which may differ from ski area reported snowfall totals.",
    bullets: [
      "SNOWD estimates daily snowfall from positive day-to-day changes in station snow depth.",
      "Stations measure conditions at a single point, so wind loading/scouring, settlement, and melt can make station-derived snowfall differ from what skiers experience across a slope or resort.",
      "Negative day-to-day snow depth changes are treated as 0 inches of new snow (not negative snowfall).",
      "Use SNOWD station snowfall as a consistent trend/comparison signal across days and storms, not as an exact on-slope storm total.",
      "Snow depth and snow water equivalent may not move together the same way in every storm because snow density changes.",
    ],
  },
  {
    title: "Forecast Snowfall: Calendar Days vs Ski Days",
    description:
      "SNOWD forecast snowfall is grouped into local calendar-day totals, which can differ from overnight ski-day expectations.",
    bullets: [
      "Forecast snowfall is summed into local calendar-day totals, not ski-area overnight reporting windows.",
      "A storm that starts late in the evening and continues overnight may be split across two dates in SNOWD.",
      "Resort reports often emphasize overnight or 24-hour totals, which may not match calendar-day totals shown in SNOWD.",
      "Morning ski conditions can reflect snow that fell the previous calendar day plus overnight accumulation and wind transport.",
      "Probability of precipitation (PoP) is the highest probability shown within that day's forecast periods, not a guarantee of the displayed snowfall total.",
      "Forecast confidence generally drops beyond about 3 days, especially for snowfall timing and exact amounts.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Knowledge & Reference | SNOWD",
  description:
    "Avalanche learning links and SNOWD interpretation guidance, including danger ratings, danger rose, snowfall timing, and derived snowfall totals.",
};

function ResourceCard({ resource }: { resource: KnowledgeResource }) {
  return (
    <a
      href={resource.href}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-xl border border-slate-800 bg-slate-800/50 p-5 transition hover:border-slate-700 hover:bg-slate-800"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {resource.source}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white group-hover:text-slate-100">
            {resource.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {resource.description}
          </p>
        </div>
        <ExternalLink className="h-5 w-5 shrink-0 self-center text-slate-400 group-hover:text-slate-200" />
      </div>
    </a>
  );
}

function ExplainerCard({
  icon,
  title,
  description,
  bullets,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
      <div className="flex items-center gap-2">
        <div className="text-slate-300">{icon}</div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      ) : null}
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300 marker:text-slate-500">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 pt-8 pb-20">
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-800/40 p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300">
            <BookOpen className="h-3.5 w-3.5" />
            Knowledge & Reference
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Avalanche Knowledge & SNOWD Data Guide
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Learn how to read avalanche forecasts, understand danger ratings and
            roses, and interpret how SNOWD displays snow and forecast data.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm leading-6 text-amber-50/95">
              Avalanche information in SNOWD is for awareness and routing to
              official forecasts. Always use the official avalanche center
              forecast for your zone and terrain before traveling in avalanche
              terrain.
            </p>
          </div>
        </div>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-300" />
            <h2 className="text-lg font-semibold text-white">
              Avalanche Forecast Education
            </h2>
          </div>
          <div className="space-y-4">
            {AVALANCHE_RESOURCES.map((resource) => (
              <ResourceCard key={resource.href} resource={resource} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-300" />
            <h2 className="text-lg font-semibold text-white">
              How To Read SNOWD Avalanche & Snow Context
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <ExplainerCard
              icon={<Mountain className="h-4 w-4" />}
              title={PRODUCT_EXPLAINERS[0].title}
              description={PRODUCT_EXPLAINERS[0].description}
              bullets={PRODUCT_EXPLAINERS[0].bullets}
            />
            <ExplainerCard
              icon={<AlertTriangle className="h-4 w-4" />}
              title={PRODUCT_EXPLAINERS[1].title}
              description={PRODUCT_EXPLAINERS[1].description}
              bullets={PRODUCT_EXPLAINERS[1].bullets}
            />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-300" />
            <h2 className="text-lg font-semibold text-white">
              How To Interpret SNOWD Snowfall Data
            </h2>
          </div>
          <div className="space-y-4">
            <ExplainerCard
              icon={<Database className="h-4 w-4" />}
              title={METHODOLOGY_SECTIONS[0].title}
              description={METHODOLOGY_SECTIONS[0].description}
              bullets={METHODOLOGY_SECTIONS[0].bullets}
            />
            <ExplainerCard
              icon={<Cloud className="h-4 w-4" />}
              title={METHODOLOGY_SECTIONS[1].title}
              description={METHODOLOGY_SECTIONS[1].description}
              bullets={METHODOLOGY_SECTIONS[1].bullets}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
