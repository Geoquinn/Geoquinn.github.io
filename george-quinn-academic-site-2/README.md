# George Quinn Academic Website

A responsive, accessible academic portfolio designed for GitHub Pages. It uses plain HTML, CSS,
and JavaScript, so there is no build step and no framework to maintain.

## Included content

- Rutgers biography and education
- Selected manuscripts and ongoing research
- Data and coding projects
- Teaching record
- Selected conference presentations and the 2024 AAPOR Best Student Poster Award
- Downloadable July 2026 CV
- Email, Google Scholar, ORCID, LinkedIn, and GitHub links

## Published site

The site is hosted with GitHub Pages at `https://geoquinn.github.io/` from the `main` branch of
the `Geoquinn/Geoquinn.github.io` repository.

## Local preview

You can open `index.html` directly in a browser. For a local web server, run this from the project
folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Design system

- Rutgers red: `#A6192E`
- Deep blue: `#2D465B`
- Slate blue: `#526D82`
- Warm white: `#F6F3EE`
- Display type: Lora
- Interface/body type: Libre Franklin

## Files

- `index.html` — homepage
- `bio.html` — biography, education, appointments, and service
- `research.html` — manuscripts, research areas, datasets, and coding projects
- `teaching.html` — courses and teaching experience
- `presentations.html` — conference presentations and awards
- `contact.html` — contact information and profile links
- `styles.css` — visual design and responsive layout
- `script.js` — mobile navigation, research accordions, and reveal effects
- `assets/George_Quinn_CV.pdf` — downloadable CV
- `assets/george-quinn-headshot.png` — homepage and bio portrait
- `assets/research-library.jpg`, `assets/teaching-banner.jpg`, `assets/hero-pattern.jpg` — site imagery
- `.nojekyll` — tells GitHub Pages to serve the files without Jekyll processing
