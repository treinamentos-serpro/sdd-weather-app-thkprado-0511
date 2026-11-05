export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  country: string | null;
  countryCode?: string | null;
  region?: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  condition: string | null;
  weatherCode: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  pressureHpa: number | null;
  precipitationMm: number | null;
  time: string | null;
}

export interface ForecastDay {
  date: string;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  condition: string | null;
  weatherCode: number | null;
  precipitationMm: number | null;
  precipitationProbabilityPercent?: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather | null;
  forecast: ForecastDay[] | null;
  timezone: string | null;
}
