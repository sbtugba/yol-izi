City suggestions are derived from GeoNames cities15000:
https://download.geonames.org/export/dump/

License: Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/).
Attribution: GeoNames (https://www.geonames.org/).
The dataset covers cities with over 15,000 inhabitants and administrative capitals.
Short searches use this local index; longer searches also use Open-Meteo.
Files are grouped by country, sorted by population, and retain alternate names.

To regenerate, extract cities15000.zip and run:
`node scripts/build-city-index.mjs path/to/cities15000.txt`
