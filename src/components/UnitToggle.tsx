import type { KeyboardEvent } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      onChange(unit === 'celsius' ? 'fahrenheit' : 'celsius');
    }
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="flex shrink-0 rounded-xl bg-white/5 p-1"
    >
      {(['celsius', 'fahrenheit'] as const).map((option) => {
        const isSelected = unit === option;
        const label = option === 'celsius' ? '°C' : '°F';

        return (
          <button
            key={option}
            type="button"
            aria-label={option === 'celsius' ? 'Celsius' : 'Fahrenheit'}
            aria-pressed={isSelected}
            onClick={() => onChange(option)}
            onKeyDown={handleKeyDown}
            className={`min-w-11 rounded-lg px-3 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 ${
              isSelected ? 'bg-accent-500 text-night-900' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
