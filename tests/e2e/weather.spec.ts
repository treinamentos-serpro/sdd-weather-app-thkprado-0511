import { expect, test, type Page } from '@playwright/test';

const city = {
  id: 1,
  name: 'Seattle',
  latitude: 47.6,
  longitude: -122.33,
  country: 'Estados Unidos',
  country_code: 'US',
  admin1: 'Washington',
};

const forecast = {
  timezone: 'America/Los_Angeles',
  current: {
    time: '2026-11-05T12:00',
    temperature_2m: 0,
    relative_humidity_2m: 70,
    weather_code: 0,
    wind_speed_10m: 8,
    surface_pressure: 1014,
    precipitation: 0,
  },
  daily: {
    time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'],
    weather_code: [0, 61, 2, 0, 1],
    temperature_2m_min: [-2, 1, 3, 4, 5],
    temperature_2m_max: [5, 6, 8, 9, 10],
    precipitation_sum: [0, 2, 0, 0, 0],
    precipitation_probability_max: [0, 80, 10, 0, 20],
  },
};

async function mockWeatherApi(page: Page, geocodingResponse: unknown = { results: [city] }) {
  let geocodingRequests = 0;
  let forecastRequests = 0;

  await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingRequests += 1;
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({ json: forecast });
  });

  return {
    get geocodingRequests() {
      return geocodingRequests;
    },
    get forecastRequests() {
      return forecastRequests;
    },
  };
}

async function searchSeattle(page: Page) {
  await page.getByRole('searchbox', { name: 'Nome da cidade' }).fill('Seattle');
  await page.getByRole('button', { name: 'Buscar cidade' }).click();
}

test('busca a cidade, mostra a previsão e converte a unidade', async ({ page }) => {
  const requests = await mockWeatherApi(page);

  await page.goto('/');
  await searchSeattle(page);

  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  await expect(page.getByText('Washington, Estados Unidos')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(page.getByText('32°F')).toBeVisible();
  expect(requests.geocodingRequests).toBe(1);
  expect(requests.forecastRequests).toBe(1);
});

test('mostra o estado vazio quando a busca não encontra cidades', async ({ page }) => {
  await mockWeatherApi(page, {});

  await page.goto('/');
  await searchSeattle(page);

  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
});

test('recupera-se de uma falha de rede ao tentar novamente', async ({ page }) => {
  let geocodingRequests = 0;
  await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingRequests += 1;
    if (geocodingRequests === 1) {
      await route.abort('failed');
      return;
    }

    await route.fulfill({ json: { results: [city] } });
  });
  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json: forecast });
  });

  await page.goto('/');
  await searchSeattle(page);
  await expect(page.getByRole('alert')).toContainText('Falha de rede.');

  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  expect(geocodingRequests).toBe(2);
});

test('supports keyboard search and moves focus to the weather result', async ({ page }) => {
  await mockWeatherApi(page);
  await page.goto('/');

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const search = page.getByRole('searchbox', { name: 'Nome da cidade' });
  await expect(search).toBeFocused();
  await page.keyboard.type('Seattle');
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeFocused();
});

test('permite completar a busca em viewport mobile sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await mockWeatherApi(page);

  await page.goto('/');
  await searchSeattle(page);

  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
});
