const cache = new Map();

export function normalizeCity(value) {
  return value
    .trim()
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i');
}

export async function suggestCities(query, countryCode, { signal } = {}) {
  const prefix = normalizeCity(query);
  if (!prefix) return [];
  if (!cache.has(countryCode)) {
    const response = await fetch(`${import.meta.env.BASE_URL}data/cities/${countryCode}.json`, {
      signal,
    });
    if (response.status === 404) return [];
    if (!response.ok) throw new Error('Şehir önerileri yüklenemedi.');
    cache.set(countryCode, await response.json());
  }
  signal?.throwIfAborted();
  return cache
    .get(countryCode)
    .filter((city) =>
      [city.name, ...city.aliases].some((name) => normalizeCity(name).startsWith(prefix)),
    )
    .slice(0, 15)
    .map(({ aliases, ...city }) => city);
}
