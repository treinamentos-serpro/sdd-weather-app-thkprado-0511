import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = city.trim();

    if (!query) {
      setShowEmptyMessage(true);
      return;
    }

    setShowEmptyMessage(false);
    onSearch(query);
  }

  return (
    <form role="search" aria-label="Buscar cidade" onSubmit={handleSubmit} className="w-full">
      <label htmlFor="city-search" className="sr-only">
        Nome da cidade
      </label>
      <div className="flex gap-2">
        <input
          id="city-search"
          type="search"
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setShowEmptyMessage(false);
          }}
          placeholder="Buscar cidade..."
          disabled={disabled}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label="Buscar cidade"
          disabled={disabled}
          className="rounded-xl bg-accent-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="sm:hidden">Buscar</span>
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>
      {showEmptyMessage && (
        <p role="alert" className="mt-2 text-sm text-amber-200">
          Digite o nome de uma cidade para buscar.
        </p>
      )}
    </form>
  );
}
