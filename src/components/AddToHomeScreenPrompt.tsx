"use client";

import { useCallback, useEffect, useState } from "react";

type DeviceType = "ios" | "android" | "other";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const DISMISSED_SESSION_KEY = "snowd-a2hs-dismissed";
const SHOW_DELAY_MS = 30_000;

function detectDeviceType(): DeviceType {
  const userAgent = window.navigator.userAgent || "";
  const isIosDevice =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);
  if (isIosDevice) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

function isStandaloneMode(): boolean {
  const inStandaloneDisplayMode = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;
  const iosNavigator = window.navigator as Navigator & {
    standalone?: boolean;
  };
  return inStandaloneDisplayMode || iosNavigator.standalone === true;
}

export default function AddToHomeScreenPrompt() {
  const [deviceType, setDeviceType] = useState<DeviceType>("other");
  const [open, setOpen] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const dismiss = useCallback(() => {
    window.sessionStorage.setItem(DISMISSED_SESSION_KEY, "1");
    setOpen(false);
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      dismiss();
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [dismiss]);

  useEffect(() => {
    const isDismissed =
      window.sessionStorage.getItem(DISMISSED_SESSION_KEY) === "1";
    if (isDismissed || isStandaloneMode()) return;

    const platform = detectDeviceType();
    if (platform === "other") return;

    const timer = window.setTimeout(() => {
      setDeviceType(platform);
      setOpen(true);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!installPromptEvent) return;

    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    setInstallPromptEvent(null);

    if (choice.outcome === "accepted") {
      dismiss();
    }
  }, [dismiss, installPromptEvent]);

  if (!open || deviceType === "other") return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[120] px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="a2hs-title"
        className="mx-auto w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/95 p-4 text-slate-100 shadow-2xl backdrop-blur"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="a2hs-title" className="text-base font-semibold">
              Add SNOWD to your Home Screen
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Save SNOWD as a bookmark on your Home Screen so it feels like an
              app.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Dismiss add to home screen prompt"
          >
            Close
          </button>
        </div>

        {deviceType === "ios" ? (
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-300">
            <li>Tap the Share button in your browser.</li>
            <li>Choose View More &gt; Add to Home Screen.</li>
            <li>Tap Add.</li>
          </ol>
        ) : (
          <div className="mt-3 text-sm text-slate-300">
            {installPromptEvent ? (
              <>
                <p>
                  Android supports this too. Use the button below for the
                  install prompt.
                </p>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="mt-3 rounded-md bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
                >
                  Add to Home Screen
                </button>
                <p className="mt-2 text-xs text-slate-400">
                  If the prompt does not appear, open the browser menu and tap
                  Install app or Add to Home screen.
                </p>
              </>
            ) : (
              <ol className="list-decimal space-y-1 pl-5">
                <li>Open the browser menu.</li>
                <li>Tap Install app or Add to Home screen.</li>
                <li>Confirm Add or Install.</li>
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
