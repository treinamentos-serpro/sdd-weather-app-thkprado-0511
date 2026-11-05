import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => void;
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<(() => void) | null>(null);

  async function loadCityWeather(city: City, operationId: number) {
    try {
      const weather = await getWeather(city);

      if (operationId !== requestId.current) {
        return;
      }

      setData(weather);
      setError(null);
      setStatus('success');
    } catch (cause) {
      if (operationId !== requestId.current) {
        return;
      }

      setError(
        cause instanceof WeatherServiceError
          ? cause.message
          : 'Ocorreu um problema ao consultar a cidade.',
      );
      setStatus('error');
    }
  }

  async function search(name: string) {
    const normalizedName = name.trim();
    const operationId = ++requestId.current;
    setQuery(normalizedName);
    setData(null);
    setCities([]);
    setError(null);

    if (!normalizedName) {
      setStatus('empty');
      lastOperation.current = null;
      return;
    }

    lastOperation.current = () => {
      void search(normalizedName);
    };
    setStatus('loading');

    try {
      const results = await searchCities(normalizedName);

      if (operationId !== requestId.current) {
        return;
      }

      setCities(results);

      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      await loadCityWeather(results[0], operationId);
    } catch (cause) {
      if (operationId !== requestId.current) {
        return;
      }

      setError(
        cause instanceof WeatherServiceError
          ? cause.message
          : 'Ocorreu um problema ao consultar a cidade.',
      );
      setStatus('error');
    }
  }

  async function selectCity(city: City) {
    const operationId = ++requestId.current;
    setQuery(city.name);
    setData(null);
    setError(null);
    setStatus('loading');
    lastOperation.current = () => {
      void selectCity(city);
    };
    await loadCityWeather(city, operationId);
  }

  function retry() {
    lastOperation.current?.();
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
