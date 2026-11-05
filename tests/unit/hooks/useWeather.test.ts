import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_WEATHER } from '../../../src/data/mockWeather';
import { useWeather } from '../../../src/hooks/useWeather';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';

vi.mock('../../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/services/weatherService')>();
  return {
    ...actual,
    getWeather: vi.fn(),
    searchCities: vi.fn(),
  };
});

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useWeather', () => {
  it('loads the first matching city and exposes the success state', async () => {
    searchCitiesMock.mockResolvedValue([MOCK_WEATHER.city]);
    getWeatherMock.mockResolvedValue(MOCK_WEATHER);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(' Seattle ');
    });

    expect(searchCitiesMock).toHaveBeenCalledWith('Seattle');
    expect(getWeatherMock).toHaveBeenCalledWith(MOCK_WEATHER.city);
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'Seattle',
      data: MOCK_WEATHER,
      cities: [MOCK_WEATHER.city],
      error: null,
    });
  });

  it('sets the empty state without loading weather when no city matches', async () => {
    searchCitiesMock.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Atlantis');
    });

    expect(result.current.status).toBe('empty');
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('retries the last search after a service error', async () => {
    searchCitiesMock.mockResolvedValue([MOCK_WEATHER.city]);
    getWeatherMock.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    getWeatherMock.mockResolvedValueOnce(MOCK_WEATHER);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Seattle');
    });

    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.' });

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(getWeatherMock).toHaveBeenCalledTimes(2);
  });

  it('loads the selected city and retries its forecast directly', async () => {
    getWeatherMock.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    getWeatherMock.mockResolvedValueOnce(MOCK_WEATHER);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(MOCK_WEATHER.city);
    });

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(getWeatherMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });
});
