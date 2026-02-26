"use client";

import { Suspense } from "react";
import { Map } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/snow-report/Footer";
import StationsExplorerSection from "@/components/stations/StationsExplorerSection";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-28">
        <PageHeader
          icon={Map}
          title="Avalanche Danger Map"
          description="Explore mountain weather stations and avalanche danger zones in one map. Use the date controls to view historic avalanche forecasts and compare danger ratings over time."
        />
        <Suspense fallback={null}>
          <StationsExplorerSection
            sectionId="map"
            enableAvalancheArchive
            showHeader={false}
          />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
