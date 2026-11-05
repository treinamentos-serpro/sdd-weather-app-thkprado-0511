import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../../../src/App';
import CurrentWeather from '../../../src/components/CurrentWeather';
import SearchBar from '../../../src/components/SearchBar';
import EmptyState from '../../../src/components/states/EmptyState';
import ErrorState from '../../../src/components/states/ErrorState';
import LoadingState from '../../../src/components/states/LoadingState';
import UnitToggle from '../../../src/components/UnitToggle';
import { MOCK_WEATHER } from '../../../src/data/mockWeather';
import { formatTemperature } from '../../../src/lib/temperature';

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
});

describe('weather display', () => {
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
    expect(screen.getByText('18°C')).toBeInTheDocument();
    expect(screen.getAllByText('20°C').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('64°F')).toBeInTheDocument();
    expect(screen.getAllByText('68°F').length).toBeGreaterThan(0);
  });

  it('mostra cinco dias e campos meteorológicos da fixture', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('Seattle')).toBeInTheDocument();
    expect(screen.getByText('80 %')).toBeInTheDocument();
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
});
