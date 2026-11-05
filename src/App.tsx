import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { MOCK_WEATHER } from './data/mockWeather';
import type { Unit } from './types/weather';

type AppStatus = 'idle' | 'loading' | 'empty' | 'error' | 'success';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [status, setStatus] = useState<AppStatus>('success');

  function handleSearch(city: string) {
    setStatus(
      city.toLocaleLowerCase('pt-BR') === MOCK_WEATHER.city.name.toLocaleLowerCase('pt-BR')
        ? 'success'
        : 'empty',
    );
  }

  return (
    <main className="min-h-screen bg-night-900 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
          >
            <span aria-hidden="true" className="text-3xl">
              🌦️
            </span>
            <span>
              <span className="block text-xl font-bold tracking-tight">Clima Agora</span>
              <span className="block text-sm text-slate-400">Previsão para sua cidade</span>
            </span>
          </a>
          <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-start">
            <SearchBar onSearch={handleSearch} disabled={status === 'loading'} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </header>

        <div className="space-y-6">
          {status === 'idle' && (
            <EmptyState
              title="Busque uma cidade"
              message="Digite o nome de uma cidade para consultar o clima."
            />
          )}
          {status === 'loading' && <LoadingState />}
          {status === 'empty' && <EmptyState />}
          {status === 'error' && (
            <ErrorState
              message="Ocorreu um problema ao consultar a cidade."
              onRetry={() => setStatus('success')}
            />
          )}
          {status === 'success' && MOCK_WEATHER.current && (
            <>
              <CurrentWeather city={MOCK_WEATHER.city} current={MOCK_WEATHER.current} unit={unit} />
              {MOCK_WEATHER.forecast && (
                <ForecastList forecast={MOCK_WEATHER.forecast} unit={unit} />
              )}
              <p className="text-center text-xs text-slate-500">
                Dados de exemplo para demonstração da interface
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
