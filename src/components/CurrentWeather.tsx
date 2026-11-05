import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCode';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const weather = getWeatherPresentation(current.weatherCode, current.condition);
  const location = [city.region, city.country].filter(Boolean).join(', ');
  const metrics = [
    { label: 'Umidade', value: current.humidityPercent, unit: '%' },
    { label: 'Vento', value: current.windSpeedKmh, unit: 'km/h' },
    { label: 'Precipitação', value: current.precipitationMm, unit: 'mm' },
    { label: 'Pressão', value: current.pressureHpa, unit: 'hPa' },
  ];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-400">
            Clima atual
          </p>
          <h2 id="current-weather-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {city.name}
          </h2>
          {location && <p className="mt-1 text-slate-300">{location}</p>}
        </div>
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="text-6xl sm:text-7xl">
            {weather.icon}
          </span>
          <div>
            <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              {formatTemperature(current.temperatureC, unit)}
            </p>
            <p className="mt-2 text-slate-300">{weather.condition}</p>
          </div>
        </div>
      </div>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/5 bg-night-800/70 p-4">
            <dt className="text-sm text-slate-400">{metric.label}</dt>
            <dd className="mt-2 text-lg font-semibold text-white">
              {metric.value === null ? '—' : `${metric.value} ${metric.unit}`}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
