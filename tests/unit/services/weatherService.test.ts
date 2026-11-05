import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

const city: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  countryCode: 'US',
  region: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
};

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('does not make a request for blank input', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('  ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('trims and encodes the query and maps geographic context', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        results: [
          {
            id: 1,
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            country: 'Brasil',
            country_code: 'BR',
            admin1: 'São Paulo',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('  São Paulo  ')).resolves.toEqual([
      {
        id: 1,
        name: 'São Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        region: 'São Paulo',
        latitude: -23.55,
        longitude: -46.63,
      },
    ]);

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('name')).toBe('São Paulo');
    expect(url.searchParams.get('count')).toBe('5');
    expect(url.searchParams.get('language')).toBe('pt');
  });

  it('returns an empty result when the response has no results array', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response({}));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Atlantis')).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('reports HTTP and network errors with WeatherServiceError', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({}, 503))
      .mockRejectedValueOnce(new TypeError('network failure'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(searchCities('Seattle')).rejects.toMatchObject({ message: 'Falha de rede.' });
  });

  it('reports invalid JSON as a service error', async () => {
    const invalidResponse = response({});
    vi.mocked(invalidResponse.json).mockRejectedValueOnce(new SyntaxError('invalid JSON'));
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(invalidResponse));

    await expect(searchCities('Seattle')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'O serviço de clima retornou uma resposta inválida.',
    });
  });

  it('reports a response-body network failure as a network error', async () => {
    const failedResponse = response({});
    vi.mocked(failedResponse.json).mockRejectedValueOnce(new TypeError('network failure'));
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(failedResponse));

    await expect(searchCities('Seattle')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Falha de rede.',
    });
  });

  it('converts an aborted request to a friendly timeout error', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const pending = searchCities('Seattle');
    const timeoutAssertion = expect(pending).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A requisição demorou demais.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await timeoutAssertion;
  });
});

describe('getWeather', () => {
  it('maps current conditions and exactly five forecast days', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        timezone: 'America/Los_Angeles',
        current: {
          time: '2026-11-05T12:00',
          temperature_2m: 14.2,
          relative_humidity_2m: 70,
          weather_code: 3,
          wind_speed_10m: 8.5,
          surface_pressure: 1014.2,
          precipitation: 0,
        },
        daily: {
          time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'],
          weather_code: [3, 61, 2, 0, 1],
          temperature_2m_min: [10, 9, 8, 11, 12],
          temperature_2m_max: [16, 15, 17, 18, 19],
          precipitation_sum: [0, 2.1, 0, 0, 0],
          precipitation_probability_max: [0, 80, 10, 0, 20],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(weather.current).toMatchObject({
      temperatureC: 14.2,
      condition: 'Nublado',
      humidityPercent: 70,
      windSpeedKmh: 8.5,
      pressureHpa: 1014.2,
      precipitationMm: 0,
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast?.[1]).toMatchObject({
      date: '2026-11-06',
      minTemperatureC: 9,
      maxTemperatureC: 15,
      condition: 'Chuva fraca',
      precipitationMm: 2.1,
      precipitationProbabilityPercent: 80,
    });

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(url.searchParams.get('longitude')).toBe(String(city.longitude));
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');
  });

  it('rejects a response without complete weather sections and five dates', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({ daily: { time: [] } }))
      .mockResolvedValueOnce(
        response({
          current: {},
          daily: { time: ['2026-11-05'] },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'O serviço de clima retornou dados incompletos.',
    });
    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'O serviço de clima retornou uma previsão incompleta.',
    });
  });

  it('preserves partial data and maps missing or invalid values to null', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        current: {
          temperature_2m: 12,
          relative_humidity_2m: 'invalid',
          precipitation: null,
        },
        daily: {
          time: [
            '2026-11-05',
            '2026-11-06',
            '2026-11-07',
            '2026-11-08',
            '2026-11-09',
          ],
          temperature_2m_max: [15],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(weather.current).toMatchObject({
      temperatureC: 12,
      humidityPercent: null,
      precipitationMm: null,
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast?.[0]).toMatchObject({
      maxTemperatureC: 15,
      minTemperatureC: null,
      precipitationMm: null,
    });
    expect(weather.forecast?.[1]).toMatchObject({
      maxTemperatureC: null,
      minTemperatureC: null,
    });
  });
});
