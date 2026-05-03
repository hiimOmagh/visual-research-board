# Visual Research Board

`v0.1.0-alpha.10`

A creator-focused, source-aware visual research board for collecting image/web references, preserving source links, organizing local projects, restoring result snapshots, previewing exports, and exporting production-ready research packs.

## Alpha.10 additions

Result-quality patch. No login, database, browser automation, full crawling, AI image generation, or team workspace.

- Improved mode-aware query expansion for creator workflows.
- Added source-group classification for Commons/open-access, institutional archives, official/academic sources, news/media, commercial stock, search/social discovery, general web, and unknown sources.
- Strengthened scoring with topic relevance, visual-resolution/aspect-ratio heuristics, source credibility tiers, license clarity, production usefulness, and mode-specific weights.
- Strengthened deduplication with URL canonicalization, image-asset keys, normalized title keys, and quality-first representative selection.
- Added “Why this result” explanations to result cards, result detail, and exports.
- Added source-grouped result display.
- Added sort controls for overall quality, production usefulness, relevance, visual quality, source credibility, license clarity, and newest collected.
- Added saved-first result sorting.
- Added quality metadata hydration for migrated alpha.9 and older saved results.
- Added source-group and quality-reason fields to exports and fixture checks.

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

Alpha.10 stores local projects under `visual-research-board:project-library:v0.1.0-alpha.10` and migrates alpha.9, alpha.8, alpha.6, alpha.5, alpha.4, and alpha.1-alpha.3 saved-result keys.

## Provider behavior

Provider health reports `active`, `no_results`, `missing_key`, `skipped`, `error`, and `timeout`, plus result count, typed result counts, query samples, endpoint samples, missing environment variable, and provider-specific message.

## Risk and license warning

The app uses cautious labels and does **not** claim commercial-use safety. Always verify source pages and license terms before publication.

## Acceptance criteria for alpha.10

- App runs without API keys using mock provider data.
- Existing project library import/export, snapshots, manual import, notes, sections, and export preview behavior remain intact.
- Results are grouped by source class rather than displayed as a flat grid only.
- Each normalized result can carry `source_group`, `duplicate_group_key`, and `quality_reasons`.
- Sorting supports saved-first and quality-dimension selection.
- Deduplication removes repeated source/image/title candidates while preferring the stronger scored representative.
- Export outputs include source-group and why-this-result context.
- QA fixture suite passes.

## Next logical build

`v0.1.0-beta.1 — MVP stabilization and scope freeze.`
