import { readFile, mkdir, writeFile } from 'node:fs/promises';

// Source: https://download.geonames.org/export/dump/cities15000.zip
const source = process.argv[2];
if (!source) throw new Error('Pass the path to cities15000.txt.');
const countries = new Map();
for (const line of (await readFile(source, 'utf8')).split('\n')) {
  if (!line.trim()) continue;
  const fields = line.split('\t');
  const [id, name, ascii, aliases, lat, lng, , , country] = fields;
  const cities = countries.get(country) || [];
  cities.push({
    id: Number(id),
    name,
    latitude: Number(lat),
    longitude: Number(lng),
    country_code: country,
    population: Number(fields[14]),
    aliases: [...new Set([ascii, ...aliases.split(',')])].filter(Boolean),
  });
  countries.set(country, cities);
}
await mkdir('public/data/cities', { recursive: true });
for (const [country, cities] of countries) {
  cities.sort((a, b) => b.population - a.population);
  await writeFile(`public/data/cities/${country}.json`, JSON.stringify(cities));
}
