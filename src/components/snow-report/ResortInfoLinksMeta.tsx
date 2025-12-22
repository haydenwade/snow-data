import {
    CableCar,
    Clock,
    Camera,
    Map as MapIcon,
    Car,
    CloudSnow,
    AlertTriangle,
    Radar,
    Cloud,
    ExternalLink,
} from "lucide-react";
import React from "react";
import { SiX } from "react-icons/si";

export type Link = { label: string; url: string };
export type BadgeType = "LIVE" | "OFFICIAL" | "MAP" | "CAM" | "RISK" | "FORECAST";

export type LinkMeta = {
  icon: React.ReactNode;
  description: string;
  badge?: BadgeType;
};

export function getLinkMeta(link: Link): LinkMeta {
  const l = link.label.toLowerCase();
  const u = link.url.toLowerCase();

  // URL-based detection (more reliable)
  if (u.includes("utahavalanchecenter.org")) {
    return {
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      description: "Backcountry danger rating + problem types",
      badge: "RISK",
    };
  }

  if (u.includes("radar.weather.gov")) {
    return {
      icon: <Radar className="h-5 w-5 text-blue-400" />,
      description: "Live precip + storm movement",
      badge: "LIVE",
    };
  }

  if (u.includes("forecast.weather.gov")) {
    return {
      icon: <Cloud className="h-5 w-5 text-blue-400" />,
      description: "NWS point forecast",
      badge: "FORECAST",
    };
  }

  if (u.includes("cottonwoodcanyons.udot.utah.gov")) {
    return {
      icon: <Camera className="h-5 w-5 text-blue-400" />,
      description: "Canyon cams + road status",
      badge: "LIVE",
    };
  }

  if (u.includes("x.com") || u.includes("twitter.com")) {
    return {
      icon: <SiX className="h-5 w-5 text-blue-400" />,
      description: "Live updates related to lifts and terrain",
      badge: "LIVE",
    };
  }

  // Label-based fallback
  if (l.includes("lift") || l.includes("terrain")) {
    return {
      icon: <CableCar className="h-5 w-5 text-blue-400" />,
      description: "What’s open right now",
      badge: "OFFICIAL",
    };
  }

  if (l.includes("parking")) {
    return {
      icon: <Car className="h-5 w-5 text-blue-400" />,
      description: "Lots, overflow, and access",
      badge: "OFFICIAL",
    };
  }

  if (l.includes("camera") || l.includes("cam")) {
    return {
      icon: <Camera className="h-5 w-5 text-blue-400" />,
      description: "See visibility + snowfall live",
      badge: "CAM",
    };
  }

  if (l.includes("trail map")) {
    return {
      icon: <MapIcon className="h-5 w-5 text-blue-400" />,
      description: "Runs + lifts layout",
      badge: "MAP",
    };
  }

  if (l.includes("hours")) {
    return {
      icon: <Clock className="h-5 w-5 text-blue-400" />,
      description: "Lifts + resort operations",
      badge: "OFFICIAL",
    };
  }

  if (l.includes("conditions") || l.includes("resort info")) {
    return {
      icon: <CloudSnow className="h-5 w-5 text-blue-400" />,
      description: "Snow report + weather",
      badge: "OFFICIAL",
    };
  }

  return {
    icon: <ExternalLink className="h-5 w-5 text-blue-400" />,
    description: "Open external resource",
  };
}
