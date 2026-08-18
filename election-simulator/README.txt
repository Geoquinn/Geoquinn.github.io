RIPPL ELECTION SIMULATOR — GITHUB PAGES INSTALLATION

Destination URL:
https://george-quinn.com/election-simulator/

1. Upload the entire election-simulator folder to the root of the
   Geoquinn/Geoquinn.github.io repository.

2. Preserve this folder structure:

   election-simulator/
     index.html
     styles.css
     simulator.js
     d3.min.js
     house-districts-120.geojson
     model1-special-elections.json
     MODEL_1_METHODOLOGY.md
     UPLOAD_GUIDE.txt
     house/index.html
     senate/index.html
     governors/index.html

3. Commit the files to the branch GitHub Pages currently publishes.

The House view opens with a blank 435-district map. Visitors can run the
data-backed Special & Off-Year Elections model repeatedly, adjust its recency
and historical translation settings, inspect district probabilities and vote
estimates, and audit the statewide and U.S. House evidence bank. The separate
four-model composite remains an interface prototype.

Model 1 is a developmental research simulation, not a published forecast.
Read MODEL_1_METHODOLOGY.md for inclusion rules, formulas, uncertainty,
demographic limitations, redistricting caveats, and the JSON data dictionary.

The map now uses the Census Bureau's official 120th-Congress geography. The
2020-2024 ACS demographic profiles were rebuilt for all 181 districts in the
ten states that changed lines for 2026. Read UPLOAD_GUIDE.txt for the exact
GitHub Pages replacement steps.
