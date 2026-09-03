# Raw sources

Committed so the county build is reproducible without network access.

| File | Source | Used for |
|---|---|---|
| `2024_US_County_Level_Presidential_Results.csv` | github.com/tonmcg/US_County_Level_Election_Results_08-24 | 2024 county margins, turnout weights, 2024 third-party share |
| `2020_US_County_Level_Presidential_Results.csv` | same | 2020 county margins; bridges AK boroughs, CT counties, DC |
| `election-context-2018.csv` | MIT Election Data + Science Lab (MEDSL), 2018 election context | 2016 and 2012 county presidential results; county demographics: Black %, Hispanic %, under-30 %, 65+ %, college %, non-college white %, median household income, rural %, USDA rural-urban continuum code |
| `counties-albers-10m.json` | us-atlas 3 (npm), Census cartographic boundaries, Albers USA pre-projected | county + state geometry |
| `silver-bulletin-pollster-ratings-2026-01.csv` | Silver Bulletin pollster ratings, January 2026 release (supplied as .xlsx, converted to CSV) | pollster OVR, SB grade, house bias, hit rate, average error, share outside the margin of error |

Regenerate with `npm run build:data` (counties) and `npm run build:pollsters`.

## Four cycles, not two

The MEDSL context file carries the 2016 and 2012 presidential vote alongside the
census variables, so the build reads four cycles even though `lean` still uses
only the last two — that is Cook's definition and changing it would stop the
state numbers matching published PVI.

The other two cycles pay for themselves twice:

**Elasticity.** A county's *lean* in a cycle is its margin minus the national
margin that year. `churn` is the mean absolute change in that lean from cycle to
cycle, over the three transitions 2012→2016→2020→2024; `elasticity` is churn
normalized so the vote-weighted national county is exactly 1.00. It separates
the places where voters actually change their minds from the ones that have
voted the same way for twelve years, and it is the multiplier the sim applies to
everything a campaign controls. The national vote-weighted mean of churn is 5.6
points per cycle. The most elastic large counties are the Rio Grande Valley
(Webb, Hidalgo), Miami-Dade, and the Utah Wasatch Front; the least are the
places that have not moved since Obama.

**Drift.** Lean in 2024 minus lean in 2012 — the twelve-year direction. Shown on
the map; not used in scoring, because `lean` already carries where a county is
now and adding its trajectory on top would double-count it.

## Third-party share, and the Utah problem

`protest` is the third-party share of all votes cast, averaged over 2016 and
2024. It is the measured size of the pool that will vote for neither major
party, and it is what makes the Libertarian Right lane worth running: Utah,
Vermont, Idaho, New Mexico and Oregon carry two to four times the national pool,
Mississippi and Florida barely any.

Utah is a genuine outlier — 14.9% blended, against a 3.7% national mean —
because Evan McMullin took 21.5% of the state in 2016. That inflates both Utah's
protest pool and its elasticity. It is left in: Utah Republicans really did
abandon their nominee that year, which is the thing both numbers are trying to
measure. The z-score clip at 2.5 SD keeps it from running away with the map.

## Known gaps

**Alaska** has no county-level source anywhere in this pipeline. It reports 2024
results by state house district and 2020 by borough, and MEDSL has no Alaska
rows at all, so its 29 boroughs carry statewide margins, statewide-average
demographics, and the national average for elasticity and third-party share.
Connecticut's 2024 planning regions are rebuilt from its 2020 counties shifted
by the state swing, and DC's 2024 wards are summed. Thirty-one counties fall
back for demographics and for the two older cycles.

**Union membership** is the one axis with no county-level source and the one
number in the build that is hand-entered rather than parsed: state rates from
BLS 2024, approximate. BLS publishes it only by state (Table 5 of the annual
Union Members release), and the figures here have not been re-verified against
the 2025 release — `www.bls.gov` is unreachable from the build environment, and
second-hand summaries of that table disagreed with each other by more than a
point on several states, which is larger than the effect being modeled. Treat
the union column as the weakest data in the file until someone can diff it
against the published table.

**Demographics** are ACS five-year estimates as of MEDSL's 2018 compilation, so
they are a decade old. The vote data is current; the census variables are not.
Fast-growing counties are the ones most likely to be misdescribed.

## Pollster ratings

Silver Bulletin rates **released public polls** in the last three weeks of a
race. Campaign pollsters do most of their work privately, so poll counts run
from 446 (Mason-Dixon, which polls publicly for news outlets) down to 1
(brilliant corners, which does not). The build mean-reverts each firm's rating
toward its editorial rating by poll count, exactly the way Silver Bulletin
itself reverts thin samples toward the mean.
