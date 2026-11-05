import type { Unit } from '../types/weather';

export function convertTemperature(value: number, from: Unit, to: Unit): number {
  if (from === to) {
    return value;
  }

  return from === 'celsius' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
}

export function formatTemperature(valueC: number | null, unit: Unit): string {
  if (valueC === null || !Number.isFinite(valueC)) {
    return '—';
  }

  const temperature = convertTemperature(valueC, 'celsius', unit);
  const symbol = unit === 'celsius' ? '°C' : '°F';

  return `${Math.round(temperature)}${symbol}`;
}
