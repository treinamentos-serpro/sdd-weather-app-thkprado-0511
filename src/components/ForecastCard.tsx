import { formatForecastDay } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCode';
import type { ForecastDay as ForecastDayData, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDayData;
  index: number;
  unit: Unit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const weather = getWeatherPresentation(day.weatherCode, day.condition);

  return (
    <article className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md">
      <h3 className="font-semibold text-white">{formatForecastDay(day.date, index)}</h3>
      <span aria-hidden="true" className="my-3 block text-4xl">
        {weather.icon}
      </span>
      <p className="text-sm text-slate-400">{weather.condition}</p>
      <div className="mt-4 flex justify-center gap-2 text-sm font-semibold">
        <span className="text-white">{formatTemperature(day.maxTemperatureC, unit)}</span>
        <span className="text-slate-400">{formatTemperature(day.minTemperatureC, unit)}</span>
      </div>
      <p className="mt-3 text-sm text-slate-300">
        <span aria-hidden="true">☂ </span>
        <span className="sr-only">Chance de chuva: </span>
        {day.precipitationProbabilityPercent == null
          ? '—'
          : `${day.precipitationProbabilityPercent}%`}
      </p>
    </article>
  );
}
