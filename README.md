# Akshay Ravella — AI Engineer Portfolio

A motion-led portfolio for agentic AI, enterprise RAG and production AI systems. It has two themes and a case-study page for each project.

## Highlights

- **Selected work wheel:** a pinned scroll section modelled on LangChain's lifecycle wheel. Scroll progress picks a project, the wheel rotates, the active pill collapses into an icon, and the copy and illustration transition with it. Below 992px it becomes stacked panels with a sticky pill bar.
- **Two themes:**
  - **Acid:** signal yellow on black.
  - **Mono:** monochrome liquid-glass, with light pools and contour lines.

  The toggle uses a circular View Transitions reveal and the choice persists in `localStorage`.
- **Case studies** at `/work/<slug>/`: each has a hero, key metrics, a sticky scroll-spy contents list, an animated architecture map, a step-by-step flow, capabilities, engineering decisions, governance, stack and role. Cross-document view transitions morph the illustration and title from the home page.
- **Illustrations:** pure HTML/CSS and theme-aware. They are sized with container query units, so they scale from the wheel card to the case-study hero.

## Structure

```
public/
  index.html              home page
  work/<slug>/index.html  case-study shells (content rendered from data.js)
  css/main.css            design tokens (both themes), layout, wheel, illustrations
  css/case.css            case-study layout
  js/data.js              project content: single source of truth
  js/visuals.js           animated project illustrations
  js/main.js              theme, nav, reveals, counters, scroll hooks
  js/home.js              selected-work wheel + experience timeline
  js/case.js              case-study renderer, scroll-spy, chart tooltip
  assets/akshay.jpg       portrait
```

To add or edit a project, change `js/data.js`. If it is a new project, also add a `work/<slug>/index.html` shell.

## Run locally

This is a static site with no build step. Paths are root-absolute, so serve the `public/` directory itself:

```bash
cd public
python3 -m http.server 8000
```

Open http://localhost:8000.

## Deploy

Publish the `public/` directory to any static host at the domain root. Fonts are loaded from Google Fonts (Space Grotesk, DM Sans, DM Mono) for the Acid theme. The Mono theme uses the system font stack.
