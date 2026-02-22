"use client";

import { CloudSnow, Snowflake } from "lucide-react";

export default function SnowLoadingGraphic({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={["inline-flex items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="sr-only">Loading</span>
      <div className="relative h-14 w-20">
        <CloudSnow className="absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 text-sky-300 animate-pulse" />
        <Snowflake
          className="absolute left-3 top-8 h-3.5 w-3.5 text-sky-100 animate-bounce"
          style={{ animationDuration: "1.1s", animationDelay: "-0.7s" }}
        />
        <Snowflake
          className="absolute left-1/2 top-8 h-3.5 w-3.5 -translate-x-1/2 text-sky-200 animate-bounce"
          style={{ animationDuration: "1.2s", animationDelay: "-0.2s" }}
        />
        <Snowflake
          className="absolute right-3 top-8 h-3.5 w-3.5 text-sky-100 animate-bounce"
          style={{ animationDuration: "1.05s", animationDelay: "-0.85s" }}
        />
      </div>
    </div>
  );
}
