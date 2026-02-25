import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Unit } from "@/types/forecast";

const STORAGE_KEY = "snowd-user-settings";

export type StoredUserLocation = {
  lat: number;
  lon: number;
  updatedAt: number;
  accuracyMeters: number | null;
};

type UserSettings = {
  unit: Unit;
  preferredLocation: StoredUserLocation | null;
  lastApprovedLocation: StoredUserLocation | null;
};

const DEFAULT_SETTINGS: UserSettings = {
  unit: "in",
  preferredLocation: null,
  lastApprovedLocation: null,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeLongitude(lon: number) {
  return ((lon + 180) % 360 + 360) % 360 - 180;
}

function normalizeCoordinateInput(location: { lat: number; lon: number }) {
  if (!Number.isFinite(location.lat) || !Number.isFinite(location.lon)) return null;

  return {
    lat: clamp(location.lat, -90, 90),
    lon: normalizeLongitude(location.lon),
  };
}

function normalizeStoredLocation(value: unknown): StoredUserLocation | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<StoredUserLocation>;
  if (
    typeof candidate.lat !== "number" ||
    !Number.isFinite(candidate.lat) ||
    typeof candidate.lon !== "number" ||
    !Number.isFinite(candidate.lon)
  ) {
    return null;
  }

  const normalized = normalizeCoordinateInput({
    lat: candidate.lat,
    lon: candidate.lon,
  });
  if (!normalized) return null;

  const accuracyMeters =
    typeof candidate.accuracyMeters === "number" &&
    Number.isFinite(candidate.accuracyMeters)
      ? Math.max(0, candidate.accuracyMeters)
      : null;

  return {
    ...normalized,
    updatedAt:
      typeof candidate.updatedAt === "number" && Number.isFinite(candidate.updatedAt)
        ? candidate.updatedAt
        : 0,
    accuracyMeters,
  };
}

function normalizeUnit(unit: unknown): Unit {
  return unit === "mm" ? "mm" : "in";
}

function normalizeSettings(value: Partial<UserSettings> | null | undefined): UserSettings {
  return {
    unit: normalizeUnit(value?.unit),
    preferredLocation: normalizeStoredLocation(value?.preferredLocation),
    lastApprovedLocation: normalizeStoredLocation(value?.lastApprovedLocation),
  };
}

export function useUserSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS,
    {
      initializeWithValue: false,
    }
  );
  const normalizedSettings = normalizeSettings(settings);

  const setUnit = useCallback(
    (unit: Unit) => {
      setSettings((prev) => ({
        ...normalizeSettings(prev),
        unit,
      }));
    },
    [setSettings]
  );

  const setPreferredLocation = useCallback(
    (location: { lat: number; lon: number }) => {
      const normalized = normalizeCoordinateInput(location);
      if (!normalized) return;

      setSettings((prev) => ({
        ...normalizeSettings(prev),
        preferredLocation: {
          ...normalized,
          updatedAt: Date.now(),
          accuracyMeters: null,
        },
      }));
    },
    [setSettings]
  );

  const clearPreferredLocation = useCallback(() => {
    setSettings((prev) => ({
      ...normalizeSettings(prev),
      preferredLocation: null,
    }));
  }, [setSettings]);

  const setLastApprovedLocation = useCallback(
    (location: { lat: number; lon: number; accuracyMeters?: number | null }) => {
      const normalized = normalizeCoordinateInput(location);
      if (!normalized) return;

      setSettings((prev) => ({
        ...normalizeSettings(prev),
        lastApprovedLocation: {
          ...normalized,
          updatedAt: Date.now(),
          accuracyMeters:
            typeof location.accuracyMeters === "number" &&
            Number.isFinite(location.accuracyMeters)
              ? Math.max(0, location.accuracyMeters)
              : null,
        },
      }));
    },
    [setSettings]
  );

  return {
    settings: normalizedSettings,
    unit: normalizedSettings.unit,
    preferredLocation: normalizedSettings.preferredLocation,
    lastApprovedLocation: normalizedSettings.lastApprovedLocation,
    setUnit,
    setPreferredLocation,
    clearPreferredLocation,
    setLastApprovedLocation,
  };
}
