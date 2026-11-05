import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-400">
            Próximos dias
          </p>
          <h2 id="forecast-title" className="mt-1 text-xl font-bold text-white sm:text-2xl">
            Previsão de 5 dias
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.slice(0, 5).map((day, index) => (
          <ForecastCard key={day.date} day={day} index={index} unit={unit} />
        ))}
      </div>
    </section>
  );
}
