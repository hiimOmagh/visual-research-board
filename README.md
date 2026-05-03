# Visual Research Board

`v0.1.0-alpha.9`

A creator-focused, source-aware visual research board for collecting image/web references, preserving source links, organizing local projects, restoring result snapshots, previewing exports, and exporting production-ready research packs.

## Alpha.9 additions

Provider-validation patch. No login, database, browser automation, full crawling, AI image generation, or team workspace.

- Expanded `.env.example` with `VISUAL_RESEARCH_BOARD_MOCK_ONLY`, `BRAVE_SEARCH_API_KEY`, and `TAVILY_API_KEY`.
- Added server-side mock-only safe mode.
- Hardened provider fetch diagnostics so HTTP/network failures surface as `error` and aborts surface as `timeout`.
- Improved missing-key diagnostics for Brave and Tavily.
- Added endpoint samples and typed result counts to provider health.
- Improved provider toggle UI with explicit API-key requirements and a one-click mock-only safe-mode toggle.
- Added `docs/provider-setup.md`.

## Install and run

```bash
npm install
npm run dev
```

The app works without API keys because mock data is enabled by default.

## Optional API keys

```bash
VISUAL_RESEARCH_BOARD_MOCK_ONLY=false
BRAVE_SEARCH_API_KEY=
TAVILY_API_KEY=
```

## Scripts

```bash
npm run qa
npm run normalization:test
npm run e2e:fixtures
npm run provider:smoke
npm run library:conflict:test
npm run typecheck
npm run lint
npm run test:ci:no-browser
```

## Storage model

Alpha.9 stores local projects under `visual-research-board:project-library:v0.1.0-alpha.9` and migrates alpha.8, alpha.6, alpha.5, alpha.4, and alpha.1-alpha.3 saved-result keys.

## Provider behavior

Provider health reports `active`, `no_results`, `missing_key`, `skipped`, `error`, and `timeout`, plus result count, typed result counts, query samples, endpoint samples, missing environment variable, and provider-specific message.

## Risk and license warning

The app uses cautious labels and does **not** claim commercial-use safety. Always verify source pages and license terms before publication.

## Acceptance criteria for alpha.9

- App runs without API keys using mock provider data.
- Wikimedia can run without an API key when the mode targets Commons.
- Brave reports `missing_key` unless `BRAVE_SEARCH_API_KEY` is present.
- Tavily reports `missing_key` unless `TAVILY_API_KEY` is present.
- `VISUAL_RESEARCH_BOARD_MOCK_ONLY=true` forces mock-only execution server-side.
- Existing project library import/export, snapshots, manual import, notes, sections, and export preview behavior remain intact.

## Next logical build

`v0.1.0-alpha.10 — result quality pass.`
