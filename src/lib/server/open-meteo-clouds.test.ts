import { pickPassHourCloud } from './open-meteo-clouds';

const HOUR = 3600;
// Mountain Daylight Time: local = UTC - 6 h.
const OFFSET = -6 * HOUR;
const utcSeconds = (iso: string) => Date.parse(iso) / 1000;

describe('pickPassHourCloud', () => {
  // Hourly from 2026-10-24 00:00 local to 2026-10-26 23:00 local.
  const start = utcSeconds('2026-10-24T06:00:00Z');
  const time = Array.from({ length: 72 }, (_, i) => start + i * HOUR);
  const cloud_cover = time.map((_, i) => i);
  const json = { utc_offset_seconds: OFFSET, hourly: { time, cloud_cover } };

  it('keeps the 1 pm local reading per day, newest first', () => {
    const days = pickPassHourCloud(json, new Date('2026-10-27T06:00:00Z'));
    expect(days).toEqual([
      { date: '2026-10-26', cloudPct: 61 },
      { date: '2026-10-25', cloudPct: 37 },
      { date: '2026-10-24', cloudPct: 13 },
    ]);
  });

  it('skips today until the pass hour has been reached', () => {
    const days = pickPassHourCloud(json, new Date('2026-10-26T18:00:00Z')); // noon local
    expect(days.map((day) => day.date)).toEqual(['2026-10-25', '2026-10-24']);
  });

  it('reads a missing value as unknown', () => {
    const gappy = { ...json, hourly: { time, cloud_cover: time.map(() => null) } };
    expect(pickPassHourCloud(gappy, new Date('2026-10-27T06:00:00Z'))[0].cloudPct).toBeNull();
  });
});
