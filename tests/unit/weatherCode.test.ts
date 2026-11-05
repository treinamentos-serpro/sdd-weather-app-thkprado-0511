import { describe, expect, it } from 'vitest';
import { getWeatherPresentation } from '../../src/lib/weatherCode';

describe('getWeatherPresentation', () => {
  it('maps a known weather code to its condition and icon', () => {
    expect(getWeatherPresentation(61, null)).toEqual({
      condition: 'Chuva fraca',
      icon: '🌧️',
    });
  });

  it('uses the supplied condition when available', () => {
    expect(getWeatherPresentation(61, 'Condição personalizada')).toEqual({
      condition: 'Condição personalizada',
      icon: '🌧️',
    });
  });

  it('provides a fallback for unknown or unavailable codes', () => {
    expect(getWeatherPresentation(999, null)).toEqual({
      condition: 'Condição indisponível',
      icon: '🌡️',
    });
    expect(getWeatherPresentation(null, null)).toEqual({
      condition: 'Condição indisponível',
      icon: '🌡️',
    });
  });
});
