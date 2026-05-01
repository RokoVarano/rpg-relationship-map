# AGENTS.md

Electron + Vue 3 desktop app (Node 18+, Vite, Tailwind CSS v4, Pinia, better-sqlite3, Cytoscape).

## Commands

- `npm run dev` — starts Vite dev server then Electron (via custom `dev-runner.js`)
- `npm run dist` — full build: `vite build` then `electron-builder` (order matters)
- `npm run build:vite` / `npm run build:electron` — run individually if needed

No test, lint, or typecheck tooling configured.

## Structure

- `src/main/index.js` — Electron main process entrypoint
- `src/main/database.js` — SQLite via better-sqlite3 (not sqlite3)
- `src/preload/` — IPC bridge
- `src/renderer/` — Vue 3 app (Vite root), output to `dist/renderer`
- `@` alias resolves to `src/` (not `src/renderer/`)

## Build & Dist

- `vite.config.js`: `base: './'`, `root: src/renderer`, build output `dist/renderer`
- `electron-builder.yml` packs `dist/**`, `src/main/**`, `src/preload/**`
- Production artifacts in `release/`: SQLite DB and `images/` sit alongside the executable
