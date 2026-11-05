import { getWeatherPresentation } from '../lib/weatherCode';
import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGeocodingResult(
  value: unknown,
): value is Record<string, unknown> & { name: string; latitude: number; longitude: number } {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude)
  );
}

function isDate(value: unknown): value is string {
  return typeof value === 'string';
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isAbortError(error: unknown): boolean {
  return isRecord(error) && error.name === 'AbortError';
}

async function fetchJson(url: string, operation: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new WeatherServiceError(
        `Não foi possível ${operation} (erro HTTP ${response.status}).`,
      );
    }

    try {
      return await response.json();
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new WeatherServiceError('O serviço de clima retornou uma resposta inválida.');
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new WeatherServiceError('A requisição demorou demais.');
    }

    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name: query,
    count: '5',
    language: 'pt',
    format: 'json',
  }).toString();

  const payload = await fetchJson(url.toString(), 'buscar cidades');

  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    return [];
  }

  return payload.results
    .filter(isGeocodingResult)
    .slice(0, 5)
    .map((result) => ({
      id: typeof result.id === 'number' ? result.id : undefined,
      name: result.name,
      country: typeof result.country === 'string' ? result.country : null,
      countryCode: typeof result.country_code === 'string' ? result.country_code : null,
      region: typeof result.admin1 === 'string' ? result.admin1 : null,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
}

function mapCurrentWeather(value: Record<string, unknown>): CurrentWeather {
  const weatherCode = nullableNumber(value.weather_code);

  return {
    temperatureC: nullableNumber(value.temperature_2m),
    condition: weatherCode === null ? null : getWeatherPresentation(weatherCode, null).condition,
    weatherCode,
    humidityPercent: nullableNumber(value.relative_humidity_2m),
    windSpeedKmh: nullableNumber(value.wind_speed_10m),
    pressureHpa: nullableNumber(value.surface_pressure),
    precipitationMm: nullableNumber(value.precipitation),
    time: typeof value.time === 'string' ? value.time : null,
  };
}

function mapForecastDay(daily: Record<string, unknown>, index: number, date: string): ForecastDay {
  const weatherCode = Array.isArray(daily.weather_code)
    ? nullableNumber(daily.weather_code[index])
    : null;
  const precipitationProbability = Array.isArray(daily.precipitation_probability_max)
    ? nullableNumber(daily.precipitation_probability_max[index])
    : null;

  return {
    date,
    minTemperatureC: Array.isArray(daily.temperature_2m_min)
      ? nullableNumber(daily.temperature_2m_min[index])
      : null,
    maxTemperatureC: Array.isArray(daily.temperature_2m_max)
      ? nullableNumber(daily.temperature_2m_max[index])
      : null,
    condition: weatherCode === null ? null : getWeatherPresentation(weatherCode, null).condition,
    weatherCode,
    precipitationMm: Array.isArray(daily.precipitation_sum)
      ? nullableNumber(daily.precipitation_sum[index])
      : null,
    precipitationProbabilityPercent: precipitationProbability,
  };
}

export async function getWeather(city: City): Promise<WeatherData> {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
  }).toString();

  const payload = await fetchJson(url.toString(), 'carregar a previsão');

  if (!isRecord(payload)) {
    throw new WeatherServiceError('O serviço de clima retornou dados incompletos.');
  }

  const current = payload.current;
  const daily = payload.daily;

  if (!isRecord(current) || !isRecord(daily)) {
    throw new WeatherServiceError('O serviço de clima retornou dados incompletos.');
  }

  const dates = daily.time;

  if (!Array.isArray(dates) || dates.length < 5 || !dates.slice(0, 5).every(isDate)) {
    throw new WeatherServiceError('O serviço de clima retornou uma previsão incompleta.');
  }

  const forecast = dates.slice(0, 5).map((date, index) => mapForecastDay(daily, index, date));

  return {
    city,
    current: mapCurrentWeather(current),
    forecast,
    timezone: typeof payload.timezone === 'string' ? payload.timezone : null,
  };
}
