import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Cloud,
  Database,
  Info,
  Map,
  Mountain,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/snow-report/Footer";

type DataSection = {
  title: string;
  description?: string;
  bullets: string[];
};

const METHODOLOGY_SECTIONS: DataSection[] = [
  {
    title: "Forecasts",
    description:
      "Forecast source depends on provider coverage for the station coordinates.",
    bullets: [
      "U.S. forecast data is sourced from the National Weather Service (`api.weather.gov`) forecast grid when available for the point.",
      "Canada and other non-NWS coverage uses Open-Meteo forecast data for the station coordinates.",
      "SNOWD normalizes snowfall units and aggregates forecast snowfall into local calendar-day totals.",
      "Forecast totals can differ from ski resort overnight totals because reporting windows are different.",
    ],
  },
  {
    title: "Historic Station Data",
    description:
      "Historic station charts and tables are built from NRCS AWDB / SNOTEL station records.",
    bullets: [
      "Source: USDA NRCS AWDB / SNOTEL (snow depth, snow water equivalent, temperature, and supported station elements).",
      "SNOWD daily snowfall is a derived value from positive day-to-day snow depth changes.",
      "Station data is a point measurement and may differ from resort-reported snowfall totals.",
    ],
  },
  {
    title: "Current Conditions",
    description:
      "Current conditions may combine station observations with weather-provider data for broader context.",
    bullets: [
      "Station observation temperature history uses NRCS AWDB / SNOTEL (TOBS) when available.",
      "U.S. weather context (wind/sky/current-condition enrichment) uses NWS observation data when available.",
      "Canada and non-NWS coverage uses Open-Meteo fallback for current weather time series and current-condition context.",
      "Displayed values may come from different providers in the same card (for example, station temperature plus weather-provider wind).",
    ],
  },
  {
    title: "Avalanche Danger",
    description:
      "SNOWD shows regional avalanche danger context and links to official forecasts. SNOWD does not create avalanche forecasts.",
    bullets: [
      "Source: Avalanche.org public API / map-layer data, which aggregates avalanche center data.",
      "The public API provides daily backcountry avalanche danger ratings for specific geographic areas in the U.S.",
      "SNOWD displays danger level context on the North American Avalanche Danger Scale (1-5) and links to the full forecast on avalanche center websites.",
      "Avalanche.org collects and distributes this data from 20 independent forecasting operations; preserving the original meaning and context is important.",
    ],
  },
];

const ATTRIBUTION_SECTIONS: DataSection[] = [
  {
    title: "Avalanche Data Notes & Update Cadence",
    description:
      "Avalanche forecast publishing cadence and source behavior affect freshness and what appears in SNOWD.",
    bullets: [
      "Avalanche centers that publish a daily forecast typically do so once each morning. Check often during morning hours (about 6-10am Mountain Time).",
      "Avalanche season timing varies by center and year, but generally runs December through April.",
      "Some avalanche centers publish summary conditions without a danger rating. These may appear as no danger in aggregated data, so check the center website for full context.",
      "Avalanche Danger Map viewing guideline: about 1:25,000 resolution (roughly web map zoom 14) for interpreting regional danger areas.",
    ],
  },
  {
    title: "Timing, Freshness & Accuracy",
    description:
      "Source latency, time zones, and aggregation windows can change what you see on a given page.",
    bullets: [
      "Station data and forecasts are requested from live APIs and may be delayed by the upstream provider.",
      "Forecast totals are grouped by local calendar day, which may not match resort overnight reporting windows.",
      "Forecast accuracy generally decreases beyond about 3 days, especially for snowfall timing and exact amounts.",
      "Historic avalanche forecast availability depends on archive coverage in the Avalanche.org map-layer endpoints.",
      "Always verify official avalanche center forecasts and local conditions before making travel decisions in avalanche terrain.",
    ],
  },
  {
    title: "Map Imagery & Attribution",
    description:
      "SNOWD keeps map attribution visible on map interfaces and documents providers here for reference.",
    bullets: [
      "Station and historic station pages use an embedded OpenStreetMap map (Mapnik layer) for station location display.",
      "The Avalanche Danger Map page includes basemap options with visible on-map attribution labels: Carto Positron, Esri World Imagery, and OpenTopoMap.",
      "Avalanche region overlays come from Avalanche.org map-layer GeoJSON responses.",
      "Map attribution is shown on map interfaces and summarized on this page.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Data & Attribution | SNOWD",
  description:
    "Source attribution and methodology for SNOWD station data, weather forecasts, avalanche regions, historic avalanche map views, and maps.",
};

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

export default function DataPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 pt-4 pb-20">
        <PageHeader
          icon={Database}
          title="Data & Attribution"
          description="Source attribution and methodology for SNOWD station data, weather forecasts, avalanche forecast regions, historic avalanche map views, and map basemaps."
        />

        <div className="mb-8 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm leading-6 text-amber-50/95">
              SNOWD provides data aggregation and routing to official sources.
              For avalanche travel decisions, always read the official avalanche
              center forecast for your zone and terrain.
            </p>
          </div>
        </div>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-300" />
            <h2 className="text-lg font-semibold text-white">
              Source Summary By Feature
            </h2>
          </div>
          <div className="space-y-4">
            <ExplainerCard
              icon={<Mountain className="h-4 w-4" />}
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
            <ExplainerCard
              icon={<Info className="h-4 w-4" />}
              title={METHODOLOGY_SECTIONS[2].title}
              description={METHODOLOGY_SECTIONS[2].description}
              bullets={METHODOLOGY_SECTIONS[2].bullets}
            />
            <ExplainerCard
              icon={<AlertTriangle className="h-4 w-4" />}
              title={METHODOLOGY_SECTIONS[3].title}
              description={METHODOLOGY_SECTIONS[3].description}
              bullets={METHODOLOGY_SECTIONS[3].bullets}
            />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Map className="h-4 w-4 text-slate-300" />
            <h2 className="text-lg font-semibold text-white">
              Attribution & Caveats
            </h2>
          </div>
          <div className="space-y-4">
            <ExplainerCard
              icon={<AlertTriangle className="h-4 w-4" />}
              title={ATTRIBUTION_SECTIONS[0].title}
              description={ATTRIBUTION_SECTIONS[0].description}
              bullets={ATTRIBUTION_SECTIONS[0].bullets}
            />
            <ExplainerCard
              icon={<Info className="h-4 w-4" />}
              title={ATTRIBUTION_SECTIONS[1].title}
              description={ATTRIBUTION_SECTIONS[1].description}
              bullets={ATTRIBUTION_SECTIONS[1].bullets}
            />
            <ExplainerCard
              icon={<Map className="h-4 w-4" />}
              title={ATTRIBUTION_SECTIONS[2].title}
              description={ATTRIBUTION_SECTIONS[2].description}
              bullets={ATTRIBUTION_SECTIONS[2].bullets}
            />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
