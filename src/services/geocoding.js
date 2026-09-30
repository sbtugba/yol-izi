import { suggestCities } from './citySuggestions';

export const countries = (() => {
  const names = new Intl.DisplayNames(['tr'], { type: 'region' });
  const codes =
    'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(
      ' ',
    );
  return codes
    .map((code) => ({ code, name: names.of(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
})();
export async function findCities(city, countryCode, { signal } = {}) {
  if (city.trim().length < 3) {
    const suggestions = await suggestCities(city, countryCode, { signal });
    return suggestions.map((result) => ({
      ...result,
      country: countries.find((country) => country.code === countryCode)?.name,
    }));
  }
  const params = new URLSearchParams({
    name: city.trim(),
    countryCode,
    count: '15',
    language: 'tr',
    format: 'json',
  });
  const timeout = AbortSignal.timeout(12000);
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) throw new Error('Konum servisine ulaşılamadı. Lütfen tekrar deneyin.');
  const data = await response.json();
  return (data.results || []).filter((item) => item.country_code === countryCode);
}

// Only choose a location automatically when the result is unambiguous.
export function uniqueCityMatch(results, query) {
  const normalize = (value) =>
    value
      .trim()
      .toLocaleLowerCase('tr')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i');
  const exact = results.filter((item) => normalize(item.name) === normalize(query));
  return exact.length === 1
    ? exact[0]
    : exact.length === 0 && results.length === 1
      ? results[0]
      : null;
}
