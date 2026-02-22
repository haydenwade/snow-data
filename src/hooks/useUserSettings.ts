import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Unit } from "@/types/forecast";

const STORAGE_KEY = "snowd-user-settings";

type UserSettings = {
  unit: Unit;
};

const DEFAULT_SETTINGS: UserSettings = {
  unit: "in",
};

export function useUserSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS,
    {
      initializeWithValue: false,
    }
  );

  const setUnit = useCallback(
    (unit: Unit) => {
      setSettings((prev) => ({
        ...prev,
        unit,
      }));
    },
    [setSettings]
  );

  return {
    settings,
    unit: settings.unit,
    setUnit,
  };
}
