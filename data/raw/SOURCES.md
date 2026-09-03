# Raw sources

Committed so the county build is reproducible without network access.

| File | Source | Used for |
|---|---|---|
| `2024_US_County_Level_Presidential_Results.csv` | github.com/tonmcg/US_County_Level_Election_Results_08-24 | 2024 county margins, turnout weights |
| `2020_US_County_Level_Presidential_Results.csv` | same | 2020 county margins; bridges AK boroughs, CT counties, DC |
| `election-context-2018.csv` | MIT Election Data + Science Lab (MEDSL), 2018 election context | county demographics: Black %, Hispanic %, under-30 %, 65+ %, college %, rural % |
| `counties-albers-10m.json` | us-atlas 3 (npm), Census cartographic boundaries, Albers USA pre-projected | county + state geometry |

Alaska reports 2024 results by state house district and Connecticut by planning region, neither of which matches the county geometry. Both are rebuilt from their 2020 county-level results shifted by the state's 2024 swing. DC's 2024 wards are summed.

State union membership rates are entered by hand in `tools/build-counties.mjs` from BLS 2024 (approximate) — the one axis with no county-level source.

Regenerate with `npm run build:data`.
