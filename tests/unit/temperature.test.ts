import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 'celsius', 'fahrenheit', 32],
    [100, 'celsius', 'fahrenheit', 212],
    [-40, 'celsius', 'fahrenheit', -40],
    [32, 'fahrenheit', 'celsius', 0],
    [18, 'celsius', 'celsius', 18],
  ] as const)('converts %s from %s to %s', (value, from, to, expected) => {
    expect(convertTemperature(value, from, to)).toBe(expected);
  });
});

describe('formatTemperature', () => {
  it('rounds the converted value and includes the selected unit symbol', () => {
    expect(formatTemperature(20.6, 'celsius')).toBe('21°C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
  });

  it('formats unavailable and non-finite values as a dash', () => {
    expect(formatTemperature(null, 'celsius')).toBe('—');
    expect(formatTemperature(Number.NaN, 'fahrenheit')).toBe('—');
    expect(formatTemperature(Number.POSITIVE_INFINITY, 'fahrenheit')).toBe('—');
  });
});
