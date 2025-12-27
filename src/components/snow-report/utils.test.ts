import { ForecastGridData } from '@/types/forecast';
import { aggregateForecastToDaily } from './utils';

const grid: ForecastGridData = {
  snowfallAmount: {
    uom: 'wmoUnit:mm',
    points: [
      { start: '2025-12-21T03:00:00+00:00', hours: 3, value: 0 },
      { start: '2025-12-21T06:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-21T12:00:00+00:00', hours: 6, value: 2.540000037849048 },
      { start: '2025-12-21T18:00:00+00:00', hours: 6, value: 2.540000037849048 },
      { start: '2025-12-22T00:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-22T06:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-22T12:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-22T18:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-23T00:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-23T06:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-23T12:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-23T18:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-24T00:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-24T06:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-24T12:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-24T18:00:00+00:00', hours: 6, value: 22.859999394416757 },
      { start: '2025-12-25T00:00:00+00:00', hours: 6, value: 76.2 },
      { start: '2025-12-25T06:00:00+00:00', hours: 6, value: 43.18000121116598 },
      { start: '2025-12-25T12:00:00+00:00', hours: 6, value: 58.41999878883402 },
      { start: '2025-12-25T18:00:00+00:00', hours: 6, value: 45.71999878883402 },
      { start: '2025-12-26T00:00:00+00:00', hours: 6, value: 38.1 },
      { start: '2025-12-26T06:00:00+00:00', hours: 6, value: 43.18000121116598 },
      { start: '2025-12-26T12:00:00+00:00', hours: 6, value: 50.8 },
      { start: '2025-12-26T18:00:00+00:00', hours: 6, value: 55.88000121116598 },
      { start: '2025-12-27T00:00:00+00:00', hours: 6, value: 45.71999878883402 },
      { start: '2025-12-27T06:00:00+00:00', hours: 6, value: 27.94000060558426 },
      { start: '2025-12-27T12:00:00+00:00', hours: 6, value: 33.01999878883402 },
      { start: '2025-12-27T18:00:00+00:00', hours: 6, value: 96.51999878883402 },
      { start: '2025-12-28T00:00:00+00:00', hours: 6, value: 55.88000121116598 },
      { start: '2025-12-28T06:00:00+00:00', hours: 6, value: 12.7 }
    ]
  },
  quantitativePrecipitation: {
    uom: 'wmoUnit:mm',
    points: [
      { start: '2025-12-21T03:00:00+00:00', hours: 3, value: 0 },
      { start: '2025-12-21T06:00:00+00:00', hours: 6, value: 0.253999994322658 },
      { start: '2025-12-21T12:00:00+00:00', hours: 6, value: 0.507999988645311 },
      { start: '2025-12-21T18:00:00+00:00', hours: 6, value: 0.507999988645311 },
      { start: '2025-12-22T00:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-22T06:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-22T12:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-22T18:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-23T00:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-23T06:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-23T12:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-23T18:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-24T00:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-24T06:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-24T12:00:00+00:00', hours: 6, value: 0 },
      { start: '2025-12-24T18:00:00+00:00', hours: 6, value: 4.825999939441574 },
      { start: '2025-12-25T00:00:00+00:00', hours: 6, value: 13.970000302791622 },
      { start: '2025-12-25T06:00:00+00:00', hours: 6, value: 5.080000075697842 },
      { start: '2025-12-25T12:00:00+00:00', hours: 6, value: 6.35 },
      { start: '2025-12-25T18:00:00+00:00', hours: 6, value: 5.080000075697842 },
      { start: '2025-12-26T00:00:00+00:00', hours: 6, value: 4.318000045418756 },
      { start: '2025-12-26T06:00:00+00:00', hours: 6, value: 4.318000045418756 },
      { start: '2025-12-26T12:00:00+00:00', hours: 6, value: 4.572000181675024 },
      { start: '2025-12-26T18:00:00+00:00', hours: 6, value: 4.825999939441574 },
      { start: '2025-12-27T00:00:00+00:00', hours: 6, value: 4.063999909162488 },
      { start: '2025-12-27T06:00:00+00:00', hours: 6, value: 2.2860000908374865 },
      { start: '2025-12-27T12:00:00+00:00', hours: 6, value: 2.540000037849048 },
      { start: '2025-12-27T18:00:00+00:00', hours: 6, value: 7.36599978804589 },
      { start: '2025-12-28T00:00:00+00:00', hours: 6, value: 4.318000045418756 },
      { start: '2025-12-28T06:00:00+00:00', hours: 6, value: 1.015999977290622 }
    ]
  },
  probabilityOfPrecipitation: {
    uom: 'wmoUnit:percent',
    points: [
      { start: '2025-12-21T03:00:00+00:00', hours: 3, value: 29 },
      { start: '2025-12-21T06:00:00+00:00', hours: 3, value: 7 },
      { start: '2025-12-21T09:00:00+00:00', hours: 3, value: 12 },
      { start: '2025-12-21T12:00:00+00:00', hours: 3, value: 15 },
      { start: '2025-12-21T15:00:00+00:00', hours: 3, value: 52 },
      { start: '2025-12-21T18:00:00+00:00', hours: 3, value: 47 },
      { start: '2025-12-21T21:00:00+00:00', hours: 3, value: 64 },
      { start: '2025-12-22T00:00:00+00:00', hours: 3, value: 20 },
      { start: '2025-12-22T03:00:00+00:00', hours: 3, value: 16 },
      { start: '2025-12-22T06:00:00+00:00', hours: 3, value: 14 },
      { start: '2025-12-22T09:00:00+00:00', hours: 3, value: 13 },
      { start: '2025-12-22T12:00:00+00:00', hours: 3, value: 22 },
      { start: '2025-12-22T15:00:00+00:00', hours: 3, value: 26 },
      { start: '2025-12-22T18:00:00+00:00', hours: 6, value: 23 },
      { start: '2025-12-23T00:00:00+00:00', hours: 6, value: 2 },
      { start: '2025-12-23T06:00:00+00:00', hours: 6, value: 1 },
      { start: '2025-12-23T12:00:00+00:00', hours: 6, value: 2 },
      { start: '2025-12-23T18:00:00+00:00', hours: 6, value: 4 },
      { start: '2025-12-24T00:00:00+00:00', hours: 6, value: 3 },
      { start: '2025-12-24T06:00:00+00:00', hours: 6, value: 9 },
      { start: '2025-12-24T12:00:00+00:00', hours: 6, value: 24 },
      { start: '2025-12-24T18:00:00+00:00', hours: 6, value: 62 },
      { start: '2025-12-25T00:00:00+00:00', hours: 6, value: 80 },
      { start: '2025-12-25T06:00:00+00:00', hours: 6, value: 70 },
      { start: '2025-12-25T12:00:00+00:00', hours: 6, value: 64 },
      { start: '2025-12-25T18:00:00+00:00', hours: 6, value: 69 },
      { start: '2025-12-26T00:00:00+00:00', hours: 6, value: 71 },
      { start: '2025-12-26T06:00:00+00:00', hours: 6, value: 75 },
      { start: '2025-12-26T12:00:00+00:00', hours: 6, value: 76 },
      { start: '2025-12-26T18:00:00+00:00', hours: 6, value: 84 },
      { start: '2025-12-27T00:00:00+00:00', hours: 6, value: 68 },
      { start: '2025-12-27T06:00:00+00:00', hours: 6, value: 58 },
      { start: '2025-12-27T12:00:00+00:00', hours: 6, value: 53 },
      { start: '2025-12-27T18:00:00+00:00', hours: 6, value: 54 },
      { start: '2025-12-28T00:00:00+00:00', hours: 6, value: 34 },
      { start: '2025-12-28T06:00:00+00:00', hours: 6, value: 33 },
      { start: '2025-12-28T12:00:00+00:00', hours: 6, value: 31 },
      { start: '2025-12-28T18:00:00+00:00', hours: 6, value: 30 },
      { start: '2025-12-29T00:00:00+00:00', hours: 6, value: 19 }
    ]
  },
  maxTemperature: {
    uom: 'wmoUnit:degC',
    points: [
      { start: '2025-12-21T14:00:00+00:00', hours: 13, value: 2.7777777777777777 },
      { start: '2025-12-22T14:00:00+00:00', hours: 13, value: 3.3333333333333335 },
      { start: '2025-12-23T14:00:00+00:00', hours: 13, value: 3.3333333333333335 },
      { start: '2025-12-24T14:00:00+00:00', hours: 13, value: 2.7777777777777777 },
      { start: '2025-12-25T14:00:00+00:00', hours: 13, value: 1.6666666666666667 },
      { start: '2025-12-26T14:00:00+00:00', hours: 13, value: 0 },
      { start: '2025-12-27T14:00:00+00:00', hours: 13, value: -1.6666666666666667 },
      { start: '2025-12-28T14:00:00+00:00', hours: 13, value: -1.6666666666666667 }
    ]
  },
  minTemperature: {
    uom: 'wmoUnit:degC',
    points: [
      { start: '2025-12-21T03:00:00+00:00', hours: 13, value: -2.2222222222222223 },
      { start: '2025-12-22T02:00:00+00:00', hours: 14, value: 0.5555555555555556 },
      { start: '2025-12-23T02:00:00+00:00', hours: 14, value: 1.1111111111111112 },
      { start: '2025-12-24T02:00:00+00:00', hours: 14, value: 0.5555555555555556 },
      { start: '2025-12-25T02:00:00+00:00', hours: 14, value: -0.5555555555555556 },
      { start: '2025-12-26T02:00:00+00:00', hours: 14, value: -0.5555555555555556 },
      { start: '2025-12-27T02:00:00+00:00', hours: 14, value: -3.3333333333333335 },
      { start: '2025-12-28T02:00:00+00:00', hours: 14, value: -6.666666666666667 }
    ]
  }
};

describe('aggregateForecastToDaily', () => {
  it('assigns snowfall, pop and temps to Denver local days and sums correctly', () => {
    const days = aggregateForecastToDaily(grid, "America/Denver");
    const byDate = Object.fromEntries(days.map((d) => [d.date, d]));

    const expected: Record<string, { snowIn: number; pop: number; tMaxC?: number; tMinC?: number; tMaxF?: number; tMinF?: number }> = {
      '2025-12-20': { snowIn: 0.0, pop: 29, tMaxC: undefined, tMinC: undefined, tMaxF: undefined, tMinF: undefined },
      '2025-12-21': { snowIn: 0.2, pop: 64, tMaxC: 3, tMinC: -2, tMaxF: 37, tMinF: 28 },
      '2025-12-22': { snowIn: 0.0, pop: 26, tMaxC: 3, tMinC: 1, tMaxF: 38, tMinF: 33 },
      '2025-12-23': { snowIn: 0.0, pop: 9, tMaxC: 3, tMinC: 1, tMaxF: 38, tMinF: 34 },
      '2025-12-24': { snowIn: 4.18, pop: 80, tMaxC: 3, tMinC: 1, tMaxF: 37, tMinF: 33 },
      '2025-12-25': { snowIn: 7.3, pop: 75, tMaxC: 2, tMinC: -1, tMaxF: 35, tMinF: 31 },
      '2025-12-26': { snowIn: 7.6, pop: 84, tMaxC: 0, tMinC: -1, tMaxF: 32, tMinF: 31 },
      '2025-12-27': { snowIn: 8.3, pop: 58, tMaxC: -2, tMinC: -3, tMaxF: 29, tMinF: 26 },
      '2025-12-28': { snowIn: 0.42, pop: 33, tMaxC: -2, tMinC: -7, tMaxF: 29, tMinF: 20 }
    };

    for (const [date, exp] of Object.entries(expected)) {
      const row = byDate[date];
      expect(row).toBeDefined();
      expect(row.snowIn).toBeCloseTo(exp.snowIn, 2);
      expect(row.pop).toBe(exp.pop);
      if (exp.tMaxC !== undefined) expect(row.tMaxC).toBe(exp.tMaxC);
      if (exp.tMinC !== undefined) expect(row.tMinC).toBe(exp.tMinC);
      if (exp.tMaxF !== undefined) expect(row.tMaxF).toBe(exp.tMaxF);
      if (exp.tMinF !== undefined) expect(row.tMinF).toBe(exp.tMinF);
    }
  });
});
