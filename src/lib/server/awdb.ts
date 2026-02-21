const AWDB_BASE_URL = "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1";
const AWDB_USER_AGENT = "snow-data (github.com)";

type QueryValue = string | number | boolean | null | undefined;

function appendQueryParams(
  searchParams: URLSearchParams,
  params: Record<string, QueryValue>,
) {
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });
}

export function buildAwdbUrl(
  path: string,
  params: Record<string, QueryValue> = {},
) {
  const searchParams = new URLSearchParams();
  appendQueryParams(searchParams, params);
  const qs = searchParams.toString();
  return `${AWDB_BASE_URL}${path}${qs ? `?${qs}` : ""}`;
}

export async function fetchAwdbJson<T>(
  path: string,
  params: Record<string, QueryValue> = {},
) {
  const url = buildAwdbUrl(path, params);
  const response = await fetch(url, {
    headers: {
      "User-Agent": AWDB_USER_AGENT,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AWDB request failed (${response.status}): ${body.slice(0, 600)}`);
  }

  return (await response.json()) as T;
}

export function parseAwdbDate(input: unknown): string | null {
  if (typeof input === "string") {
    const match = input.match(/\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?/);
    if (match) return match[0];
    const dt = new Date(input);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    return null;
  }

  if (typeof input === "number") {
    const dt = new Date(input);
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
  }

  if (input && typeof input === "object") {
    const candidate =
      (input as { date?: unknown }).date ??
      (input as { Date?: unknown }).Date ??
      (input as { validDate?: unknown }).validDate ??
      (input as { obsDate?: unknown }).obsDate ??
      (input as { beginDate?: unknown }).beginDate ??
      (input as { endDate?: unknown }).endDate;
    return parseAwdbDate(candidate);
  }

  return null;
}

export function awdbDateToIso(
  awdbDate: string,
  utcOffsetHours: number | null | undefined,
) {
  const match = awdbDate.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/,
  );
  if (!match) {
    const fallback = new Date(awdbDate);
    return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4] ?? "0");
  const minute = Number(match[5] ?? "0");
  const offsetMinutes = Math.round((utcOffsetHours ?? 0) * 60);
  const utcMillis =
    Date.UTC(year, month - 1, day, hour, minute, 0, 0) -
    offsetMinutes * 60_000;
  return new Date(utcMillis).toISOString();
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
