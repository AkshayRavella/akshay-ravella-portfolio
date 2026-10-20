# Akshay Ravella — AI Engineer Portfolio

A responsive, motion-led portfolio highlighting AI engineering, Agentic RAG, Text-to-SQL, AI-powered test generation, vision-language models, and intelligent data products.

## Repository contents

- `public/index.html` — complete portfolio page, case studies, experience, education, certifications, and contact links
- `public/theme.css` — responsive design system, animated AI architecture hero, project visuals, and scroll effects
- `public/app.js` — scroll reveals, count-up metrics, reading progress, and responsive mobile navigation

## Live version

https://akshay-ravella.hatchable.site

## Run locally

This is a static site with no build or npm step required:

```bash
cd public
python3 -m http.server 8000
```

Open http://localhost:8000.

## Deploy

The web assets are kept inside `public/`. This works with static hosting providers configured to publish that directory. GitHub Pages can be enabled with a workflow that uploads `public/` as the Pages artifact.

Fonts are loaded from Google Fonts at runtime (DM Sans, DM Mono, and Space Grotesk).
