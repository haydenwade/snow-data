import { parseRadarTimes, pickRadarFrames } from './radar-frames';

const MINUTE = 60_000;
const at = (iso: string) => Date.parse(iso);

describe('parseRadarTimes', () => {
  it('reads the time dimension oldest first', () => {
    const xml =
      '<Layer><Dimension name="time" default="x" units="ISO8601">2026-10-18T19:14:14.000Z,2026-10-18T19:12:01.000Z</Dimension></Layer>';
    expect(parseRadarTimes(xml)).toEqual([at('2026-10-18T19:12:01Z'), at('2026-10-18T19:14:14Z')]);
  });

  it('returns nothing without a time dimension', () => {
    expect(parseRadarTimes('<Layer></Layer>')).toEqual([]);
  });
});

describe('pickRadarFrames', () => {
  // Scans every 2 min from 19:01 to 21:13.
  const scans = Array.from({ length: 67 }, (_, i) => at('2026-10-18T19:01:00Z') + i * 2 * MINUTE);

  it('keeps the newest scan plus one per earlier 10-minute mark, up to 12', () => {
    const frames = pickRadarFrames(scans);
    expect(frames).toHaveLength(12);
    expect(frames[frames.length - 1]).toBe(at('2026-10-18T21:13:00Z'));
    expect(frames[frames.length - 2]).toBe(at('2026-10-18T21:09:00Z'));
    expect(frames[0]).toBe(at('2026-10-18T19:29:00Z'));
  });

  it('keeps older frames stable when a new scan arrives', () => {
    const before = pickRadarFrames(scans);
    const after = pickRadarFrames([...scans, at('2026-10-18T21:15:00Z')]);
    expect(after.slice(0, -1)).toEqual(before.slice(0, -1).filter((t) => after.includes(t)));
    expect(after).toContain(at('2026-10-18T21:09:00Z'));
  });

  it('skips marks with no scan nearby', () => {
    const sparse = [at('2026-10-18T19:00:00Z'), at('2026-10-18T21:05:00Z')];
    expect(pickRadarFrames(sparse)).toEqual([at('2026-10-18T21:05:00Z')]);
  });

  it('handles no scans', () => {
    expect(pickRadarFrames([])).toEqual([]);
  });
});
