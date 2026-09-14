# CSC 4330 — Project 3

React + JavaScript foundation for our group application, built with [Vite](https://vite.dev/guide/).

## Get started

Install Node.js 22.12 or newer (Node 22 recommended) and npm. If you use nvm, run `nvm install` and `nvm use` in this folder.

```sh
git clone https://github.com/Sauz21/4330-Project-3.git
cd 4330-Project-3
npm ci
npm run dev
```

Open the local URL printed in the terminal. Changes to source files update the page automatically.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Check JavaScript and React with Oxlint |
| `npm run build` | Build production files in `dist/` |
| `npm run check` | Run lint and the production build |
| `npm run preview` | Preview a production build after building |

## Project structure

```text
src/
  assets/                 Images and other imported assets
  components/
    AppLayout.jsx         Shared header, main content, and footer
  pages/
    HomePage.jsx          Initial placeholder screen
  App.jsx                 Composes the app layout and page
  App.css                 Layout and page styles
  index.css               Global styles and shared CSS variables
  main.jsx                React entry point
public/                   Static files served without processing
docs/frontend-checks.yml.example  Optional GitHub Actions workflow template
```

Keep reusable UI in `components/` and screen components in `pages/`. Add feature-specific folders as the app grows. This starter has no backend, authentication, database, or routing yet; those should follow the group's app requirements.

## Working as a group

1. Pull the latest `main`: `git switch main` then `git pull --ff-only`.
2. Create a descriptive branch, for example `git switch -c feature/home-page`.
3. Make your changes and run `npm run check`.
4. Commit, push your branch, and open a pull request for group review.

Commit `package-lock.json` when dependencies change. Use `npm ci` after pulling dependency updates. An optional GitHub Actions template is in `docs/frontend-checks.yml.example`. To enable automatic checks, a maintainer with workflow permissions can copy it to `.github/workflows/ci.yml` and push that file. Until then, run `npm run check` locally before opening a pull request.

## Environment variables

Local `.env` files are ignored by Git. If a feature needs configuration, add a documented `.env.example` with placeholder values. Vite exposes variables prefixed with `VITE_` to the browser, so they must never contain secrets or private API keys.

## Scope

This commit establishes the runnable frontend and team workflow. The placeholder page is ready to be replaced with the group's first app screen. Deployment and automated feature tests can be added when the app's requirements are defined.
