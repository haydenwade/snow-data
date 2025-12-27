"use client";
import { useEffect, useMemo, useState } from "react";
import {
    Snowflake,
    Wind,
    Thermometer,
    Cloud,
    Mountain,
    AlertTriangle,
    Car,
    History,
    MapPin,
    CableCar,
} from "lucide-react";

type Feature = {
  label: string;
  icon: React.ReactNode;
};

export default function RotatingFeatures() {
  const features: Feature[] = useMemo(
    () => [
      { label: "Snowfall", icon: <Snowflake className="h-12 w-12" /> },
      { label: "Wind", icon: <Wind className="h-12 w-12" /> },
      { label: "Temperature", icon: <Thermometer className="h-12 w-12 " /> },
      { label: "Sky cover", icon: <Cloud className="h-12 w-12" /> },
      { label: "Terrain status", icon: <Mountain className="h-12 w-12" /> },
      { label: "Lift status", icon: <CableCar className="h-12 w-12" /> },
      { label: "Avalanche forecast", icon: <AlertTriangle className="h-12 w-12" /> },
      { label: "Traffic", icon: <Car className="h-12 w-12" /> },
      { label: "Parking", icon: <MapPin className="h-12 w-102" /> },
      { label: "Historical snowfall", icon: <History className="h-12 w-12" /> },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % features.length);
    }, 1800);
    return () => clearInterval(id);
  }, [features.length]);

  const current = features[index];

  return (
    <div className="mt-6 flex flex-col items-center justify-center select-none text-slate-200">
      <div className="flex items-center justify-center">
        {current.icon}
      </div>
      <div className="mt-3 text-lg font-large text-slate-200">
        {current.label}
      </div>
      {/* Dots intentionally hidden to reduce visual noise */}
    </div>
  );
}
