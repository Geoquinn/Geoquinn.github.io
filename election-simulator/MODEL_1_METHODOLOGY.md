# RIPPL Model 1 — Special and Off-Year Elections

Status: developmental research simulation, not a published election forecast.

## What the model estimates

Model 1 converts Democratic over- or underperformance in completed 2025–2026 special and off-year elections into a national 2026 election environment. It applies that environment to all 435 House districts, all 35 scheduled Senate elections, and all 36 scheduled governor elections. The House model adds a deliberately limited demographic adjustment where district profiles match the 2026 lines. The statewide models add separate office and race uncertainty. Repeated simulations produce seat or governorship totals, vote estimates, predictive intervals, and win probabilities.

The displayed shift is measured in Democratic two-party margin points. For example, moving from D+4 in a district's 2024 presidential result to D+10 in a special election is a D+6 shift.

## Evidence bank

The downloadable `model1-special-elections.json` currently contains:

- 94 qualifying cases: 85 state-legislative specials, 7 U.S. House specials, and the 2025 New Jersey and Virginia gubernatorial elections.
- 86 cases with usable Census profiles for demographic estimation.
- 435 district baselines based on the 2024 presidential vote calculated for 2026 congressional lines.
- 435 official 120th-Congress district shapes from the Census Bureau's August 2026 TIGER/Line release.
- Demographic coverage for all 435 districts, including rebuilt profiles for the 181 districts in the ten states that changed lines.
- Official 2022 House comparisons for 199 districts whose lines and partisan vote are sufficiently comparable.

Qualifying special elections must be marked complete/official in the source bank and must have Democratic plus Republican vote of at least 90 percent. A same-party runoff is not treated as a partisan shift. A multi-candidate special primary is not compared with a general-election baseline. Alaska and Maine ranked-choice contests are excluded from the 2022 diagnostic comparison. The 2022 comparison is descriptive and is not mixed directly into the live special-election signal.

The two statewide anchors are reported separately in the interface:

| Election | 2025 two-party margin | Shift vs. 2024 president | Shift vs. 2022 U.S. House aggregate |
|---|---:|---:|---:|
| New Jersey governor | D+14.36 | D+8.45 | D+4.49 |
| Virginia governor | D+15.36 | D+9.58 | D+11.74 |

## Signal construction

For each included case `i`:

`shift_i = special_margin_i - 2024_presidential_margin_i`

The model combines the shifts using three weights:

1. Recency: exponential decay with a viewer-selected half-life of 180, 365, or 540 days.
2. Office: statewide and U.S. House contests receive more weight than state-legislative contests.
3. Data quality: only the qualifying completed contests described above enter the live signal.

The default 365-day specification currently produces an observed bank signal of about D+12.25 with an estimated standard error of 1.56 points. Because special-election voters are not a random sample of general-election voters, the default “history-calibrated” setting translates only 0.757 of that signal to November. That factor is estimated from the relationship between special-election overperformance and the subsequent presidential-to-House shift in the 2018 and 2022 midterm cycles. The interface also exposes a cautious 0.55× and direct 1.00× interpretation.

## Demographic adjustment

The district-level adjustment is a weighted ridge regression of case overperformance using 2020–2024 American Community Survey profiles. Features are non-Hispanic White, non-Hispanic Black, Hispanic, bachelor's degree or higher, bachelor's degree or higher among adults 65+, foreign-born, poverty, and a White/senior-college interaction proxy.

Regularization is selected with leave-one-state-out cross-validation. The current lambda is 128 and the out-of-state RMSE is 14.91 points. Because this is a noisy, ecological relationship, predicted adjustments are multiplied by 0.45 and capped at ±3.5 points. They describe district composition, not the behavior of any individual demographic group.

Alabama, California, Florida, Louisiana, Missouri, North Carolina, Ohio, Tennessee, Texas, and Utah changed congressional lines after the 119th-Congress district profiles were produced. This release replaces the earlier provisional shapes with the Census Bureau's official 120th-Congress geography. For those states, 2020–2024 ACS block-group estimates provide population, age, race, overall education, and income inputs; tract estimates provide senior education, detailed Hispanic origin, foreign-born, and poverty inputs. Each small-area polygon is assigned to the new district containing an interior representative point, and its counts are then aggregated to the district.

That reaggregation is an estimate because some tracts and block groups cross a new district boundary. It is substantially better aligned with the 2026 map than reusing old-district profiles, but it should not be treated as a Census-published 120th-Congress ACS tabulation. The demographic effects remain ridge-shrunk and capped at ±3.5 points.

## Monte Carlo simulation

Each run draws:

- an election-bank signal around its estimated standard error;
- uncertainty around the selected national translation factor;
- a common national election error with a 2.5-point standard deviation;
- independent district error with a 4.5-point standard deviation; and
- turnout around 72 percent of the district's 2024 presidential vote.

The visitor may run 500, 1,000, or 2,500 simulations. “Run again” creates a new random seed. The chamber panel reports the median Democratic seat count, an 80 percent seat range, and Democratic control probability. District ratings come from simulated Democratic win probability:

| Rating | Democratic probability |
|---|---:|
| Solid D | 95% or higher |
| Likely D | 85% to under 95% |
| Lean D | 65% to under 85% |
| Toss-up | 35% to under 65% |
| Lean R | over 15% to under 35% |
| Likely R | over 5% to 15% |
| Solid R | 5% or lower |

### Senate and governor extension

The statewide pages use the same weighted special-election bank and historical
translation settings as the House model. The 2024 presidential baseline for
each state is reconstructed by adding the presidential votes in every House
district in that state. A two-point adjustment is applied toward the party of a
running incumbent. Candidate names are display metadata only; they do not yet
create a candidate-quality adjustment.

For every simulated statewide election, the browser draws:

- a heavy-tailed latent special-election signal using a Student-*t* posterior
  approximation centered on the recency- and office-weighted bank;
- a translation coefficient centered on the selected cautious, historical, or
  direct specification;
- the same 2.5-point national election error used by the House model;
- a shared office shock of 2.5 points for Senate or 3.5 points for governors;
  and
- an independent race error of 6.5 points for Senate or 7.5 points for
  governors.

The national and office draws are shared by every race in a simulated election.
This creates correlated outcomes: a favorable national draw tends to help the
same party across multiple states. Only the final race error is independent.

The Senate summary starts with 34 Democratic-caucus and 31 Republican seats not
on the 2026 ballot, adds the winners of 35 races, and uses 51 seats as the
Democratic-control threshold. The governor summary starts with 6 Democratic and
8 Republican governorships not on the 2026 ballot, adds the winners of 36
races, and uses 26 as the majority threshold. Visitors may run 100, 500, 1,000,
2,500, or 5,000 elections. Each page reports the median final holdings, an 80
percent holdings range, control or majority probability, the posterior national
shift, a histogram of outcomes, and race-level 80 percent predictive intervals.

Projected statewide turnout applies the model's expected midterm turnout ratio
to the state's 2024 presidential vote. Democratic and Republican shares divide
98 percent of the projected vote according to the simulated median margin; the
remaining 2 percent is assigned to other candidates. These are scenario vote
counts, not turnout forecasts fitted separately by state.

The Senate and governor candidate arrays live in `statewide-simulator.js`. A
field containing “nominee” or “primary winner” is deliberately shown as
provisional. Named candidates are a cycle snapshot and should be checked against
state election certification before publication. Replacing a display name does
not change the modeled probability unless a future version adds and documents a
candidate-quality parameter.

### Map and toss-up results interface

The district map uses the same 435 official shapes described above but places
them inside an interactive transform layer. Visitors may zoom from 100 to 1,200
percent with the mouse wheel, trackpad, pinch gesture, or map buttons and may
drag the map while zoomed. Reset map restores the national view. The selected
district remains highlighted when the detail panel rerenders.

The toss-up district rail is not a separate forecasting rule. It filters the
current simulation to districts already rated Toss-up—a Democratic win
probability above 35 percent and below 65 percent—and sorts them by proximity to
50 percent. Each card reports the same simulated vote shares, raw vote counts,
win probability, margin, and nominee snapshot used in the district explorer.

### Repeated-election batch lab

The separate batch lab reports complete simulated elections rather than averaging district outcomes across draws. A visitor can run 100, 250, 500, or 1,000 elections. Each election independently redraws the special-election bank signal, translation uncertainty, national election error, and all 435 district errors. The tracker records Democratic and Republican seats, chamber control, and the realized national shift for every reported outcome. It displays the control frequency, median chamber, 80 percent seat range, recent outcomes, and a compact seat distribution. Results are stored only in the visitor's browser and may be downloaded as CSV.

### Nominee snapshot

`house-nominees-2026.json` is a separate, replaceable candidate snapshot keyed to the same Census district IDs as the map and model. The August 18, 2026 build uses the national 2026 House race tables on Wikipedia. A party name is shown only when exactly one Democratic or Republican candidate is listed for the district; a multi-candidate field is labeled “Nominee not yet available.” This avoids selecting a primary winner that has not been determined, but the file remains a public-data snapshot and should be checked against official state certification before publication as a definitive ballot list.

## Data file structure

`model1-special-elections.json` is designed to be replaceable as new cases arrive:

- `model`: parameters, calibration, uncertainty, turnout assumptions, and ridge coefficients.
- `summary`: NJ/VA comparisons, the House-special audit, tracker headline values, and redrawn states.
- `cases`: one row per qualifying election with dates, office, major-party vote, 2024/2020 baselines, shift, demographic profile, and base weight.
- `districts`: one row per 2026 House district with presidential baseline, incumbent label, 2022 diagnostic result, Census profile, boundary vintage, demographic construction method, and demographic adjustment.
- `sources` and `notes`: source links and interpretation limits shown by the research package.

`house-nominees-2026.json` contains one record per district with Democratic and Republican nominee fields, active-field counts, public race status, retrieval date, and source metadata. Rebuild it with `python scripts/build-house-nominees.py --html SOURCE.html --model model1-special-elections.json --output house-nominees-2026.json` after saving a fresh copy of the source page.

Rebuild the official map and redrawn-state demographic profiles with `python scripts/build-120th-district-data.py`, then rebuild the simulation file with `node scripts/build-model1-data.mjs` from the project source checkout. When updating the live case bank, preserve the field names so the simulator remains backward compatible.

## Principal sources

- The Downballot, special-election tracker and data guide: https://www.the-downballot.com/p/data
- The Downballot, 2024 presidential results for 2026 House lines: https://www.the-downballot.com/p/the-downballots-calculations-of-presidential
- Office of the House Historian, official 2022 election statistics: https://history.house.gov/Institution/Election-Statistics/2022election/
- U.S. Census Bureau, 120th-Congress district geography: https://www.census.gov/programs-surveys/decennial-census/about/rdo/congressional-districts.html
- U.S. Census Bureau, 2020–2024 ACS 5-year data: https://www.census.gov/data/developers/data-sets/acs-5year/2024.html
- New Jersey Division of Elections: https://www.nj.gov/state/elections/election-information-results-county-election-officials.shtml
- Virginia historical election results: https://historical.elections.virginia.gov/
- National 2026 U.S. House race tables and candidate status snapshot: https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections
- U.S. Senate, Class II roster: https://www.senate.gov/senators/Class_II.htm
- National Governors Association, 2026 gubernatorial elections: https://www.nga.org/governors/elections/
