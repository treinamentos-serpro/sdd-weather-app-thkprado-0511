import { describe, expect, it } from 'vitest';
import { formatForecastDay } from '../../src/lib/format';

describe('formatForecastDay', () => {
  it('labels the first two forecast days as today and tomorrow', () => {
    expect(formatForecastDay('2026-11-05', 0)).toBe('Hoje');
    expect(formatForecastDay('2026-11-06', 1)).toBe('Amanhã');
  });

  it('formats later dates as a Portuguese weekday independently of local timezone', () => {
    expect(formatForecastDay('2026-11-07', 2)).toBe('sáb');
  });
});
