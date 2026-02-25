"use client";

import { useCallback, useRef, useState } from "react";
import { LocateFixed, MapPin, Ruler, Settings, Star, Trash2 } from "lucide-react";
import LocationPickerMap from "@/components/settings/LocationPickerMap";
import Footer from "@/components/snow-report/Footer";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserSettings } from "@/hooks/useUserSettings";

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function formatTimestamp(value: number) {
  if (!value) return "Unknown time";
  return new Date(value).toLocaleString();
}

function getGeolocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location permission was denied.";
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Location is unavailable right now.";
  }
  if (error.code === error.TIMEOUT) {
    return "Location request timed out.";
  }
  return error.message || "Unable to get browser location.";
}

export default function SettingsPage() {
  const {
    unit,
    setUnit,
    preferredLocation,
    lastApprovedLocation,
    setPreferredLocation,
    clearPreferredLocation,
    setLastApprovedLocation,
  } = useUserSettings();
  const { favorites, clearFavorites } = useFavorites();
  const latInputRef = useRef<HTMLInputElement | null>(null);
  const lonInputRef = useRef<HTMLInputElement | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isRequestingBrowserLocation, setIsRequestingBrowserLocation] = useState(false);

  const handleClearFavorites = useCallback(() => {
    if (!favorites.length) return;

    const confirmed = window.confirm(
      `Remove all ${favorites.length} favorite${favorites.length === 1 ? "" : "s"}?`
    );

    if (!confirmed) return;
    clearFavorites();
  }, [clearFavorites, favorites.length]);

  const handleSaveLocationFromInputs = useCallback(() => {
    const lat = Number.parseFloat(latInputRef.current?.value ?? "");
    const lon = Number.parseFloat(lonInputRef.current?.value ?? "");

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setLocationError("Enter valid latitude and longitude values.");
      setLocationStatus(null);
      return;
    }

    if (lat < -90 || lat > 90) {
      setLocationError("Latitude must be between -90 and 90.");
      setLocationStatus(null);
      return;
    }

    if (lon < -180 || lon > 180) {
      setLocationError("Longitude must be between -180 and 180.");
      setLocationStatus(null);
      return;
    }

    setPreferredLocation({ lat, lon });
    setLocationError(null);
    setLocationStatus("Selected location saved.");
  }, [setPreferredLocation]);

  const handleMapSelect = useCallback(
    (location: { lat: number; lon: number }) => {
      setPreferredLocation(location);
      setLocationError(null);
      setLocationStatus("Selected location updated from map.");
    },
    [setPreferredLocation]
  );

  const handleUseLastApprovedLocation = useCallback(() => {
    if (!lastApprovedLocation) return;

    const nextLocation = {
      lat: lastApprovedLocation.lat,
      lon: lastApprovedLocation.lon,
    };
    setPreferredLocation(nextLocation);
    setLocationError(null);
    setLocationStatus("Selected location set to last approved browser location.");
  }, [lastApprovedLocation, setPreferredLocation]);

  const handleClearLocation = useCallback(() => {
    if (!preferredLocation) return;

    const confirmed = window.confirm("Clear the selected location from this device?");
    if (!confirmed) return;

    clearPreferredLocation();
    setLocationError(null);
    setLocationStatus("Selected location cleared.");
  }, [clearPreferredLocation, preferredLocation]);

  const handleUseBrowserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Browser geolocation is not available on this device.");
      setLocationStatus(null);
      return;
    }

    setIsRequestingBrowserLocation(true);
    setLocationError(null);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setLastApprovedLocation({
          ...nextLocation,
          accuracyMeters:
            typeof position.coords.accuracy === "number"
              ? position.coords.accuracy
              : null,
        });
        setPreferredLocation(nextLocation);
        setLocationError(null);
        setLocationStatus("Browser location approved and saved.");
        setIsRequestingBrowserLocation(false);
      },
      (error) => {
        setLocationError(getGeolocationErrorMessage(error));
        setLocationStatus(null);
        setIsRequestingBrowserLocation(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 }
    );
  }, [setLastApprovedLocation, setPreferredLocation]);

  const locationInputKey = preferredLocation
    ? `${preferredLocation.lat.toFixed(6)},${preferredLocation.lon.toFixed(6)},${preferredLocation.updatedAt}`
    : "no-location";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-28">
        <div className="mb-6 flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50">
            <Settings className="h-5 w-5 text-slate-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-slate-400">
              Manage app-wide preferences for snow reports and favorites.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/40 text-slate-200">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Unit of Measure</h2>
                <p className="text-sm text-slate-400">
                  Applies across all pages that show snow, temperature, and wind values.
                </p>
              </div>
            </div>

            <div className="inline-flex rounded-xl overflow-hidden border border-slate-700/50">
              <button
                type="button"
                onClick={() => setUnit("in")}
                className={`px-4 py-2 text-sm transition-colors ${
                  unit === "in"
                    ? "bg-slate-700/70 text-white"
                    : "bg-slate-800/60 text-slate-300"
                }`}
                aria-pressed={unit === "in"}
              >
                Imperial
              </button>
              <button
                type="button"
                onClick={() => setUnit("mm")}
                className={`px-4 py-2 text-sm transition-colors ${
                  unit === "mm"
                    ? "bg-slate-700/70 text-white"
                    : "bg-slate-800/60 text-slate-300"
                }`}
                aria-pressed={unit === "mm"}
              >
                Metric
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/40 text-slate-200">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Location</h2>
                <p className="text-sm text-slate-400">
                  Save a device location manually and keep a cached last approved browser
                  location.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleUseBrowserLocation}
                disabled={isRequestingBrowserLocation}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LocateFixed className="h-4 w-4" />
                {isRequestingBrowserLocation ? "Requesting Location..." : "Use Browser Location"}
              </button>
              <button
                type="button"
                onClick={handleUseLastApprovedLocation}
                disabled={!lastApprovedLocation}
                className="inline-flex items-center justify-center rounded-xl border border-slate-600/70 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Use Last Approved
              </button>
              <button
                type="button"
                onClick={handleClearLocation}
                disabled={!preferredLocation}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear Location
              </button>
            </div>

            <div
              key={locationInputKey}
              className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <label className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Latitude
                </span>
                <input
                  ref={latInputRef}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={-90}
                  max={90}
                  defaultValue={
                    preferredLocation ? formatCoordinate(preferredLocation.lat) : ""
                  }
                  placeholder="40.760800"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Longitude
                </span>
                <input
                  ref={lonInputRef}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={-180}
                  max={180}
                  defaultValue={
                    preferredLocation ? formatCoordinate(preferredLocation.lon) : ""
                  }
                  placeholder="-111.891000"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSaveLocationFromInputs}
                  className="w-full rounded-xl border border-slate-600/70 bg-slate-700/50 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Save Lat/Lon
                </button>
              </div>
            </div>

            {locationError ? (
              <p className="mt-3 text-sm text-red-300">{locationError}</p>
            ) : null}
            {locationStatus ? (
              <p className="mt-3 text-sm text-emerald-300">{locationStatus}</p>
            ) : null}

            <div className="mt-4">
              <LocationPickerMap
                key={`${
                  preferredLocation
                    ? `${preferredLocation.lat.toFixed(6)},${preferredLocation.lon.toFixed(6)}`
                    : "none"
                }|${
                  lastApprovedLocation
                    ? `${lastApprovedLocation.lat.toFixed(6)},${lastApprovedLocation.lon.toFixed(6)}`
                    : "none"
                }`}
                selectedLocation={
                  preferredLocation
                    ? { lat: preferredLocation.lat, lon: preferredLocation.lon }
                    : null
                }
                lastApprovedLocation={
                  lastApprovedLocation
                    ? {
                        lat: lastApprovedLocation.lat,
                        lon: lastApprovedLocation.lon,
                      }
                    : null
                }
                onSelect={handleMapSelect}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-300">
              <div className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-300 ring-2 ring-orange-500/40" />
                Selected location
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400 ring-2 ring-sky-200/40" />
                Last approved browser location
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div>
                <span className="text-slate-400">Selected:</span>{" "}
                {preferredLocation ? (
                  <>
                    {formatCoordinate(preferredLocation.lat)},{" "}
                    {formatCoordinate(preferredLocation.lon)}
                    <span className="text-slate-500">
                      {" "}
                      · updated {formatTimestamp(preferredLocation.updatedAt)}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500">None</span>
                )}
              </div>
              <div>
                <span className="text-slate-400">Last approved:</span>{" "}
                {lastApprovedLocation ? (
                  <>
                    {formatCoordinate(lastApprovedLocation.lat)},{" "}
                    {formatCoordinate(lastApprovedLocation.lon)}
                    <span className="text-slate-500">
                      {" "}
                      · updated {formatTimestamp(lastApprovedLocation.updatedAt)}
                      {lastApprovedLocation.accuracyMeters != null
                        ? ` · ±${Math.round(lastApprovedLocation.accuracyMeters)}m`
                        : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500">No browser location cached yet</span>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-red-500/20 bg-red-950/20 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-300">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Favorites</h2>
                <p className="text-sm text-slate-400">
                  Remove all saved favorites from this device.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-300">
                {favorites.length} favorite{favorites.length === 1 ? "" : "s"} saved
              </div>
              <button
                type="button"
                onClick={handleClearFavorites}
                disabled={!favorites.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove All Favorites
              </button>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
}
