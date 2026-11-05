import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../../src/App';
import CurrentWeather from '../../../src/components/CurrentWeather';
import SearchBar from '../../../src/components/SearchBar';
import EmptyState from '../../../src/components/states/EmptyState';
import ErrorState from '../../../src/components/states/ErrorState';
import LoadingState from '../../../src/components/states/LoadingState';
import UnitToggle from '../../../src/components/UnitToggle';
import { MOCK_WEATHER } from '../../../src/data/mockWeather';
import { formatTemperature } from '../../../src/lib/temperature';
import { getWeather, searchCities } from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

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
  searchCitiesMock.mockResolvedValue([MOCK_WEATHER.city]);
  getWeatherMock.mockResolvedValue(MOCK_WEATHER);
});

async function loadAppWeather(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('searchbox', { name: 'Nome da cidade' }), 'Seattle');
  await user.click(screen.getByRole('button', { name: 'Buscar cidade' }));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible(),
  );
}

describe('SearchBar', () => {
  it('envia a cidade sem espaços extras', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox', { name: 'Nome da cidade' }), ' Seattle ');
    await user.click(screen.getByRole('button', { name: 'Buscar cidade' }));

    expect(onSearch).toHaveBeenCalledWith('Seattle');
  });

  it('não envia uma busca vazia', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: 'Buscar cidade' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade');
  });

  it('does not send a query containing only spaces', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Nome da cidade' }), {
      target: { value: '   ' },
    });
    await user.click(screen.getByRole('button', { name: 'Buscar cidade' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade');
  });

  it('supports submitting the search form with Enter', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox', { name: 'Nome da cidade' }), 'Seattle');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('Seattle');
  });

  it('exposes the search form busy state while disabled', () => {
    render(<SearchBar onSearch={vi.fn()} disabled />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});

describe('weather display', () => {
  it('starts in the idle state and prompts for a city', () => {
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Busque uma cidade');
    expect(searchCitiesMock).not.toHaveBeenCalled();
  });

  it('marca a unidade ativa e permite alterá-la pelo teclado', () => {
    const onChange = vi.fn();

    render(<UnitToggle unit="celsius" onChange={onChange} />);
    const celsiusButton = screen.getByRole('button', { name: 'Celsius' });

    expect(celsiusButton).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(celsiusButton, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('converte os dados atuais e os cartões para Fahrenheit', async () => {
    const user = userEvent.setup();

    render(<App />);
    await loadAppWeather(user);
    expect(screen.getByText('18°C')).toBeInTheDocument();
    expect(screen.getAllByText('20°C').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('64°F')).toBeInTheDocument();
    expect(screen.getAllByText('68°F').length).toBeGreaterThan(0);
  });

  it('converte 0°C para 32°F sem repetir a consulta meteorológica', async () => {
    const user = userEvent.setup();
    getWeatherMock.mockResolvedValueOnce({
      ...MOCK_WEATHER,
      current: { ...MOCK_WEATHER.current!, temperatureC: 0 },
    });

    render(<App />);
    await loadAppWeather(user);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('32°F')).toBeInTheDocument();
    expect(getWeatherMock).toHaveBeenCalledOnce();
  });

  it('mostra cinco dias e campos meteorológicos da fixture', async () => {
    const user = userEvent.setup();
    render(<App />);
    await loadAppWeather(user);

    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('Seattle')).toBeInTheDocument();
    expect(screen.getByText('80 %')).toBeInTheDocument();
  });

  it('keeps partial weather data readable without displaying undefined or NaN', async () => {
    getWeatherMock.mockResolvedValueOnce({
      ...MOCK_WEATHER,
      current: { ...MOCK_WEATHER.current!, temperatureC: null, humidityPercent: null },
      forecast: MOCK_WEATHER.forecast!.map((day) => ({
        ...day,
        minTemperatureC: null,
        maxTemperatureC: null,
        precipitationProbabilityPercent: null,
      })),
    });
    const user = userEvent.setup();

    render(<App />);
    await loadAppWeather(user);

    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/undefined|NaN/);
  });

  it('formata valores indisponíveis e conversões padrão', () => {
    expect(formatTemperature(null, 'celsius')).toBe('—');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
  });
});

describe('query states', () => {
  it('expõe loading como status', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando previsão do tempo');
  });

  it('expõe uma ação de retry no erro', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState message="Falha ao carregar." onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('identifica o estado vazio', () => {
    render(<EmptyState />);
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
  });
});

describe('current weather', () => {
  it('continua mostrando a seção quando um valor está indisponível', () => {
    const current = { ...MOCK_WEATHER.current!, humidityPercent: null };

    render(<CurrentWeather city={MOCK_WEATHER.city} current={current} unit="celsius" />);

    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('marks loading busy and focuses the result after a successful search', async () => {
    let resolveCities!: (cities: City[]) => void;
    searchCitiesMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCities = resolve;
        }),
    );
    const user = userEvent.setup();

    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Nome da cidade' }), 'Seattle');
    await user.click(screen.getByRole('button', { name: 'Buscar cidade' }));

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toHaveAttribute(
      'aria-busy',
      'true',
    );

    await act(async () => {
      resolveCities([MOCK_WEATHER.city]);
    });

    const resultHeading = await screen.findByRole('heading', { name: 'Seattle' });
    expect(resultHeading).toHaveFocus();
    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
  });
});
