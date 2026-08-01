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

## Publish with GitHub Pages

1. Create a new **public** GitHub repository named `Geoquinn.github.io`.
2. Upload every file in this folder to the repository's `main` branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder, then save.
6. GitHub will display the website address after the first deployment finishes.

The site will publish at `https://geoquinn.github.io/`.

## Local preview

You can open `index.html` directly in a browser. For a local web server, run this from the project
folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Design system

- Forest: `#183D36`
- Slate: `#526B62`
- Charcoal: `#202826`
- Muted gold: `#B6924A`
- Off-white: `#F4F1E8`
- Pale sage: `#DDE3DA`
- Display type: Cormorant Garamond
- Interface/body type: Source Sans 3

## Files

- `index.html` — content and page structure
- `styles.css` — visual design and responsive layout
- `script.js` — mobile navigation, section highlighting, and reveal effects
- `assets/George_Quinn_CV.pdf` — downloadable CV
- `.nojekyll` — tells GitHub Pages to serve the files without Jekyll processing
