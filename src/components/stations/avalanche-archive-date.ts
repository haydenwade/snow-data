const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function getLocalIsoDate(date = new Date()) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

export function isIsoDateString(value: string | null | undefined): value is string {
  return typeof value === "string" && ISO_DATE_PATTERN.test(value);
}

export function parseIsoDateToLocalDate(isoDate: string | null | undefined) {
  if (!isIsoDateString(isoDate)) return null;

  const [yearText, monthText, dayText] = isoDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function normalizeAvalancheArchiveDate(
  value: string | null | undefined,
  options?: {
    maxDate?: string;
  },
) {
  const parsed = parseIsoDateToLocalDate(value);
  if (!parsed) return null;

  const normalized = getLocalIsoDate(parsed);
  const maxDate = options?.maxDate;
  if (isIsoDateString(maxDate) && normalized >= maxDate) {
    return null;
  }

  return normalized;
}

export function addDaysToIsoDate(isoDate: string, days: number) {
  const parsed = parseIsoDateToLocalDate(isoDate);
  if (!parsed) return null;

  const shifted = new Date(parsed);
  shifted.setDate(shifted.getDate() + days);
  return getLocalIsoDate(shifted);
}

export function formatAvalancheArchiveDateLabel(isoDate: string) {
  const parsed = parseIsoDateToLocalDate(isoDate);
  if (!parsed) return isoDate;

  return parsed
    .toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}
