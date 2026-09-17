# EscapePlan

A mobile-first vacation recommendation and packing assistant built in the existing React 19 + Vite project with plain JavaScript and CSS.

## Run locally

Use the Node version in `.nvmrc` (Node 22), then run:

```sh
npm ci
npm run dev
```

Dependency installation requires access to npm. Once dependencies are installed, the application runs against the local Vite server without internet access. Production files in `dist/` can be served by a local static server (`npm run preview` after building). The app makes no API or external asset requests. It is a Vite web application, not an APK, and does not install a service worker for hosted-site offline reloads.

## Features

- Header dark-mode toggle with a saved preference (`escapeplan.theme`). On first visit, the app uses the device theme. The toggle remains usable if browser storage is blocked.
- Home, preferences quiz, top-three recommendations, destination details, packing checklists, and My Trip.
- Exactly 15 sample destinations: three each for Beach, Mountains, City, Theme Park, and Camping.
- Category match: 5 points; budget match: 3; travel preference match: 2; each distinct matching activity: 1. Ties sort by destination ID ascending. Trip length supplies packing context and does not affect scores.
- Choose one destination as My Trip from destination details. Only one current trip is selected at a time. My Trip shows its description, location, category, highlights, activities, selected trip length when available, and an interactive packing checklist with progress. Replacing or clearing My Trip requires confirmation; existing packing lists are kept.
- LocalStorage keys `escapeplan.currentTrip` and `escapeplan.checklists` preserve the current destination with its selected trip length and per-destination packing progress. Custom checklist items can be added and deleted; all items can be checked and unchecked. Existing checklists are reused. The former `escapeplan.saved` collection is no longer used; choose a destination to start My Trip.
- Budget labels are illustrative preferences, not prices. All destination information is static inspiration. No accounts, APIs, databases, geolocation, maps, or live travel data.
- Responsive CSS landscapes, semantic forms, visible focus indicators, keyboard controls, page focus management, and an accessible packing progress indicator.

Saved data stays in this browser on this device. Clearing browser storage removes it. Malformed stored data falls back safely; if storage writes fail, the app continues for the session and displays a message.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite locally |
| `npm run lint` | Run Oxlint |
| `npm test` | Run all Vitest tests once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run build` | Build the production web app into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Run lint, tests, and production build |

## Code guide

- `src/App.jsx`: application state, navigation, recommendations/details screens, current-trip selection and confirmation, and persistence coordination.
- `src/components/`: shared layout, illustrated landscape, and destination card.
- `src/pages/`: Home, quiz, packing, and My Trip screens. My Trip reuses the packing screen's checklist controls.
- `src/data/destinations.js`: local destination data and quiz choices.
- `src/utils/recommendations.js`: pure scoring, ranking, and match explanations.
- `src/utils/storage.js`: validated storage reads and base checklist generation.
- `src/index.css` and `src/App.css`: global, responsive, and component styles.
- `src/test/setup.js`: jsdom, jest-dom, cleanup, and isolated storage setup.
- `src/test/App.test.jsx`: UI flows, validation, persistence, custom packing items, and malformed storage recovery.
- `src/utils/recommendations.test.js`: data completeness, score weights, ordering, ties, and immutability.

`.github/workflows/test-and-build.yml` runs on pushes to `main` and `feature/**`, and pull requests targeting `main`. It uses checkout/setup-node v4, `.nvmrc`, npm caching, `npm ci`, lint, tests, and a production build.
