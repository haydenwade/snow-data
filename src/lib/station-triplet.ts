function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeTripletInput(raw: string) {
  let value = String(raw ?? "").trim();
  if (!value) return null;

  for (let idx = 0; idx < 3; idx += 1) {
    const decoded = safeDecode(value).trim();
    if (decoded === value) break;
    value = decoded;
  }

  const upper = value.toUpperCase();
  if (!/^[^:]+:[^:]+:[^:]+$/.test(upper)) return null;
  return upper;
}
