"use client";

import { useSyncExternalStore } from "react";

// Prerendered pages would otherwise bake in the build-time year, so read the
// year from the browser's clock once the component is on the client.
const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();

export default function Copyright() {
  const year = useSyncExternalStore(subscribe, getYear, getYear);

  return (
    <span className="text-sm text-slate-500">
      &copy; {year} WaWe, LLC. All rights reserved.
    </span>
  );
}
