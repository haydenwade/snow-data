"use client";

import { Suspense } from "react";
import Footer from "@/components/snow-report/Footer";
import StationsExplorerSection from "@/components/stations/StationsExplorerSection";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-28">
        <Suspense fallback={null}>
          <StationsExplorerSection
            sectionId="map"
            title="Avalanche Danger Map"
            description="Explore mountain weather stations and avalanche danger zones in one map. Use the date controls to view historic avalanche forecasts and compare danger ratings over time."
            enableAvalancheArchive
          />
        </Suspense>
        <Footer textOverride="Don't see the location you are looking for?" />
      </div>
    </div>
  );
}
