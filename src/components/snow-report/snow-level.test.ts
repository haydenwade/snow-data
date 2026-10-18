import { ForecastDaily, ForecastGridData } from '@/types/forecast';
import { aggregateForecastToDaily } from './utils';
import { formatSnowLevelRange, isRainRiskAtElevation } from './snow-level';

const emptyGrid: ForecastGridData = {
  snowfallAmount: { uom: 'wmoUnit:mm', points: [] },
  probabilityOfPrecipitation: { uom: 'wmoUnit:percent', points: [] },
};

describe('snow level aggregation', () => {
  it('turns the NWS snow level series into a daily range in feet', () => {
    const [day] = aggregateForecastToDaily(
      {
        ...emptyGrid,
        snowLevel: {
          uom: 'wmoUnit:m',
          points: [
            { start: '2026-10-18T12:00:00+00:00', hours: 3, value: 2000 },
            { start: '2026-10-18T15:00:00+00:00', hours: 3, value: 2500 },
          ],
        },
      },
      'UTC',
    );
    expect(day.snowLevelKind).toBe('snow-level');
    expect(day.snowLevelMinFt).toBe(6562);
    expect(day.snowLevelMaxFt).toBe(8202);
  });

  it('falls back to the Open-Meteo freezing level', () => {
    const [day] = aggregateForecastToDaily(
      {
        ...emptyGrid,
        freezingLevel: {
          uom: 'wmoUnit:m',
          points: [{ start: '2026-10-18T12:00:00+00:00', hours: 1, value: 3000 }],
        },
      },
      'UTC',
    );
    expect(day.snowLevelKind).toBe('freezing-level');
    expect(day.snowLevelMaxFt).toBe(9843);
  });

  it('leaves the range empty without level data', () => {
    const [day] = aggregateForecastToDaily(
      {
        ...emptyGrid,
        snowfallAmount: {
          uom: 'wmoUnit:mm',
          points: [{ start: '2026-10-18T12:00:00+00:00', hours: 1, value: 1 }],
        },
      },
      'UTC',
    );
    expect(day.snowLevelMinFt).toBeUndefined();
    expect(formatSnowLevelRange(day, 'in')).toBeNull();
  });
});

describe('snow level labels', () => {
  const day: ForecastDaily = {
    date: '2026-10-18',
    snowIn: 2,
    pop: 60,
    snowLevelMinFt: 6540,
    snowLevelMaxFt: 8020,
    snowLevelKind: 'snow-level',
  };

  it('rounds to the nearest 100 ft', () => {
    expect(formatSnowLevelRange(day, 'in')).toBe('6,500–8,000 ft');
  });

  it('formats meters for metric users', () => {
    expect(formatSnowLevelRange(day, 'mm')).toBe('1,993–2,444 m');
  });

  it('flags rain when the snow level rises above the station with precip likely', () => {
    expect(isRainRiskAtElevation(day, 7500)).toBe(true);
    expect(isRainRiskAtElevation(day, 8500)).toBe(false);
    expect(isRainRiskAtElevation({ ...day, pop: 10 }, 7500)).toBe(false);
  });

  it('does not flag rain from the freezing-level fallback', () => {
    expect(isRainRiskAtElevation({ ...day, snowLevelKind: 'freezing-level' }, 7500)).toBe(false);
  });
});
