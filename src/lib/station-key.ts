import { normalizeTripletInput } from "@/lib/station-triplet";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeStationKeyInput(raw: string) {
  let value = String(raw ?? "").trim();
  if (!value) return null;

  for (let idx = 0; idx < 3; idx += 1) {
    const decoded = safeDecode(value).trim();
    if (decoded === value) break;
    value = decoded;
  }

  const lower = value.toLowerCase();
  if (!/^[a-z0-9][a-z0-9-_]*$/.test(lower)) return null;
  return lower;
}

export function stationKeyToTriplet(stationKey: string) {
  const normalized = normalizeStationKeyInput(stationKey);
  if (!normalized) return null;

  const parts = normalized.split("-").filter(Boolean);
  if (parts.length < 3) return null;

  const network = parts.pop();
  const state = parts.pop();
  const stationId = parts.join("-");

  if (!network || !/^[a-z0-9]+$/.test(network)) return null;
  if (!state || !/^[a-z]{2}$/.test(state)) return null;
  if (!stationId || !/^[a-z0-9-_]+$/.test(stationId)) return null;

  return `${stationId.toUpperCase()}:${state.toUpperCase()}:${network.toUpperCase()}`;
}

export function stationTripletToKey(stationTriplet: string) {
  const normalizedTriplet = normalizeTripletInput(stationTriplet);
  if (!normalizedTriplet) return null;

  const [stationId, state, network] = normalizedTriplet.split(":");
  if (!stationId || !state || !network) return null;

  return `${stationId.toLowerCase()}-${state.toLowerCase()}-${network.toLowerCase()}`;
}
