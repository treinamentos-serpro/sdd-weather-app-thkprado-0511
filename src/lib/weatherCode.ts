interface WeatherPresentation {
  condition: string;
  icon: string;
}

const WEATHER_CODES: Record<number, WeatherPresentation> = {
  0: { condition: 'Céu limpo', icon: '☀️' },
  1: { condition: 'Predominantemente limpo', icon: '🌤️' },
  2: { condition: 'Parcialmente nublado', icon: '⛅' },
  3: { condition: 'Nublado', icon: '☁️' },
  45: { condition: 'Nevoeiro', icon: '🌫️' },
  48: { condition: 'Nevoeiro com geada', icon: '🌫️' },
  51: { condition: 'Garoa fraca', icon: '🌦️' },
  53: { condition: 'Garoa moderada', icon: '🌦️' },
  55: { condition: 'Garoa intensa', icon: '🌧️' },
  61: { condition: 'Chuva fraca', icon: '🌧️' },
  63: { condition: 'Chuva moderada', icon: '🌧️' },
  65: { condition: 'Chuva intensa', icon: '🌧️' },
  71: { condition: 'Neve fraca', icon: '🌨️' },
  73: { condition: 'Neve moderada', icon: '🌨️' },
  75: { condition: 'Neve intensa', icon: '❄️' },
  80: { condition: 'Pancadas de chuva', icon: '🌦️' },
  81: { condition: 'Pancadas de chuva', icon: '🌧️' },
  82: { condition: 'Pancadas de chuva fortes', icon: '⛈️' },
  95: { condition: 'Tempestade', icon: '⛈️' },
};

export function getWeatherPresentation(
  weatherCode: number | null,
  condition: string | null,
): WeatherPresentation {
  const mapped = weatherCode === null ? undefined : WEATHER_CODES[weatherCode];

  return {
    condition: condition ?? mapped?.condition ?? 'Condição indisponível',
    icon: mapped?.icon ?? '🌡️',
  };
}
