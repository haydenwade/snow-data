type ShareStationOptions = {
  stationName?: string;
  url?: string;
};

function getPageStationName(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const title = document.querySelector("h1")?.textContent?.trim();
  return title ? title : undefined;
}

export async function shareStation(options: ShareStationOptions = {}): Promise<void> {
  if (typeof window === "undefined") return;

  const stationName = options.stationName?.trim() || getPageStationName();
  const shareUrl = options.url || window.location.href;
  const shareData: ShareData = stationName
    ? {
        title: `${stationName} | SNOWD`,
        text: `${stationName} snow conditions`,
        url: shareUrl,
      }
    : {
        title: "SNOWD",
        text: "Snow conditions on SNOWD",
        url: shareUrl,
      };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }
  } catch {}

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}
