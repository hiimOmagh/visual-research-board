# Visual Research Board

`v0.3.2 board sections + source organization package`

A source-aware visual research workspace for creators, editors, documentary teams, thumbnail designers, and researchers. It turns a topic, person, event, or concept into a curated local reference board with source URLs, provider diagnostics, rights/risk labels, notes, board sections, review feedback, ranking calibration, and exportable production packs.

## Stable free-source scope

This release keeps the local MVP usable without paid APIs. It deliberately avoids login, database, browser automation, search-engine scraping, full crawling, AI image generation, and team workspace features.

Implemented:

- Next.js App Router, TypeScript, Tailwind dark editorial UI.
- Local project library with create, rename, duplicate, delete, switch, import, and export.
- Search workflow with mode/depth selection, provider toggles, broad image-first query planning, diagnostics, and result snapshots.
- Mock-first operation with no API keys required.
- Free/no-key backend image providers: Wikimedia Commons, Openverse, Library of Congress, Internet Archive, and NASA Images.
- Free-key open-access providers: Smithsonian Open Access and Europeana, disabled until keys are supplied.
- Optional legacy/API providers: Brave and Tavily, disabled by default and not part of the free-only core.
- Reference Search Hub for Google Images, Bing Images, DuckDuckGo Images, Yandex Images, Startpage Images, Qwant Images, Mojeek, Pinterest, and YouTube. These are launcher-only; the app does not scrape search-result pages.
- GitHub Pages static-demo mode using client-side mock search, reference launchers, local project library, and local metadata fallback.
- Result quality layer: source grouping, scoring, broad-result deduplication, saved-first sorting, and “Why this result” explanations.
- Saved board with notes, board sections, manual URL import, metadata fetch/fallback, and persistence.
- Manual quality review loop for saved references with relevance, visual usefulness, source trust, license status, final verdict, reviewer note, and Quality Review export.
- Review-evidence feedback calibration that converts saved-board reviews into conservative ranking signals for repeated domains, source groups, providers, and exact sources.
- Rights/access labeling on normalized results: source access mode, rights status, and reuse risk.
- Export preview drawer and JSON, Markdown, CSV, attribution, source-audit, production-brief, and moodboard exports.
- Executable QA fixtures for normalization, provider smoke shape, project snapshots, library conflict import, source invariants, review feedback, and free-image retrieval behavior.
- Deployment workflows for CI and GitHub Pages static demo.
- Provider runtime readiness endpoint and runtime smoke script for deployed evidence capture.
- Live retrieval quality calibration with creator-gate scoring and runtime artifact capture.
- Retrieval weak-case auto-tuning with tuned query branches, provider/source/license weighting, and diversity-aware reranking.
- Deployed browser evidence capture that classifies hosted builds as Next.js runtime, GitHub Pages static demo, or broken/unknown surface.
- Real-topic test matrix with operational thresholds across historical, documentary, thumbnail, public-domain, news, moodboard, and academic-source scenarios.
- Query expansion and source-class routing so each provider receives source-appropriate query variants instead of the same generic front-sliced list.
- Ranking explainability with per-result factor breakdowns, review-delta visibility, confidence labels, and calibration audit diagnostics.
- Project-specific review evidence memory with reset/stale diagnostics and export-visible calibration isolation.
- Board-section organization upgrade with a richer default taxonomy, editable tags, notes coverage, organization warnings, and section-aware exports.

## v0.3.2 focus

This package upgrades the saved board into a structured source organization layer. It adds a richer section taxonomy, editable normalized tags, organization audit warnings, section-kind metadata, migration support for older section buckets, and export-visible board organization summaries. Ranking explainability and project-specific review memory remain intact.

## Free image retrieval boundary

This release is designed to retrieve more relevant visual/source candidates without paid APIs. It uses free/no-key providers where possible, free-key open-access providers where needed, strict provider toggles, manual reference launchers, source preservation, deduplication, and rights/risk labeling.

It still cannot literally fetch every image on the web. The target is broad, legal, source-aware retrieval with manual reference import for search-engine discoveries.

See `docs/free-image-retrieval-reference-hub.md`, `docs/provider-normalization-deduplication.md`, `docs/query-expansion-source-class-routing.md`, `docs/ranking-explainability-calibration-audit.md`, `docs/project-specific-review-evidence-memory.md`, `docs/board-sections-source-organization.md`, and `docs/provider-setup.md`.

## Install and run locally

```bash
npm install
npm run dev
```

Open the local Next.js URL printed by the terminal. The app works without API keys because mock data is enabled by default.

## Validate before deployment

```bash
npm run qa
npm run typecheck
npm run lint
npm run build
```

Full runtime validation:

```bash
npm run validate:full
```

Full deployment validation, including static export:

```bash
npm run validate:deploy
```

## Optional API keys

Create `.env.local` only when enabling optional providers in a Next.js runtime deployment:

```bash
VISUAL_RESEARCH_BOARD_MOCK_ONLY=false
SMITHSONIAN_API_KEY=
EUROPEANA_API_KEY=
BRAVE_SEARCH_API_KEY=
TAVILY_API_KEY=
```

No key is needed for Wikimedia Commons, Openverse, Library of Congress, Internet Archive, NASA Images, mock search, or the Reference Search Hub. Brave and Tavily are disabled by default and are not part of the free-only core.

## GitHub Pages static demo

GitHub Pages cannot run Next.js API routes. Use the included static-demo build when deploying to GitHub Pages:

```bash
npm run build:static:repo
```

This exports `out/` and uses `/visual-research-board` as the base path. For a different repository name, run:

```bash
VISUAL_RESEARCH_BOARD_BASE_PATH=/your-repo-name npm run build:static:pages
```

For a root/custom-domain Pages site, omit the base path:

```bash
npm run build:static
```

Static demo mode keeps the UI, mock search, Reference Search Hub, local project library, saved board, snapshots, manual import fallback, and exports. It intentionally disables real provider calls and server-side metadata extraction.

## Vercel / Next.js runtime deployment

Use Vercel or another Next.js-compatible runtime for real provider-backed behavior.

Recommended settings:

```text
Framework: Next.js
Install command: npm install
Build command: npm run build
Output directory: default
```

Add provider keys as environment variables only when needed.

## Deployed evidence and real-topic matrix

After deploying to Vercel, GitHub Pages, or another host, capture evidence with:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-deployed-url.example npm run deployed:browser:test
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-deployed-url.example npm run topic:matrix:test
```

The first command writes `artifacts/deployed-browser-evidence.json` and classifies the deployment surface as `next_runtime`, `static_demo`, or `unknown_or_broken`. The second command writes `artifacts/real-topic-test-matrix.json` and checks whether real creator topics meet candidate, image, source-diversity, and saveable-result thresholds.

Strict gates are available:

```bash
VISUAL_RESEARCH_BOARD_REQUIRE_NEXT_RUNTIME=true npm run deployed:browser:test
VISUAL_RESEARCH_BOARD_REQUIRE_TOPIC_MATRIX_PASS=true npm run topic:matrix:test
```

See `docs/deployed-browser-evidence.md` and `docs/real-topic-test-matrix.md`.

## Scripts

```bash
npm run qa
npm run normalization:test
npm run e2e:fixtures
npm run provider:smoke
npm run provider:runtime:test
npm run provider:runtime:check
npm run normalization:dedupe:check
npm run board:organization:check
npm run retrieval:quality:test
npm run retrieval:calibration:check
npm run retrieval:autotune:check
npm run evidence:tuning:test
npm run evidence:tuning:check
npm run library:conflict:test
npm run typecheck
npm run lint
npm run build
npm run build:static
npm run build:static:repo
npm run validate
npm run validate:full
npm run validate:deploy
npm run test:ci:no-browser
```

## Storage model

The project schema remains compatible and stores local projects under:

```text
visual-research-board:project-library:v0.1.0
```

It migrates beta.1, alpha.10, alpha.9, alpha.8, alpha.6, alpha.5, alpha.4, and alpha.1-alpha.3 saved-result keys.

## Provider behavior

Provider health reports:

```text
active | no_results | missing_key | skipped | error | timeout
```

Diagnostics include result counts, typed result counts, query samples, endpoint samples, missing environment variables, provider toggle state, mock-only state, retrieval evidence, live quality calibration, auto-tuning trace, evidence-driven tuning trace, and provider runtime readiness.

## Risk and license warning

The app uses cautious labels and does **not** claim commercial-use safety. License labels are candidates. Verify source pages and license terms before publication or commercial use.

## Stable acceptance criteria

- App runs locally without API keys using mock provider data.
- Runtime provider mode retrieves broad visual/source candidates across multiple query branches rather than a small single-query sample.
- App degrades to client-side mock search if API routes are unavailable.
- GitHub Pages static demo can be exported while clearly disabling real providers.
- Next.js runtime deployment keeps API routes for search, export, metadata, and real provider validation.
- Project library import/export, conflict-safe merge, snapshots, manual import, notes, sections, and export preview behavior remain intact.
- Results are grouped by source class and each result can carry `source_group`, `duplicate_group_key`, and `quality_reasons`.
- Sorting supports saved-first and quality-dimension selection.
- Deduplication removes repeated source/image/title candidates while preferring the stronger scored representative.
- Export outputs include source-group and why-this-result context.
- QA fixture suite passes.
- `/api/provider-runtime` reports key readiness without exposing secrets.
- `npm run provider:runtime:test` can capture `artifacts/provider-runtime-evidence.json` against localhost or a deployed runtime.
- `npm run retrieval:quality:test` can capture `artifacts/retrieval-quality-calibration.json` against localhost or a deployed runtime.
- Search diagnostics include `quality_calibration` with `passes_creator_gate`, failure-specific verdicts, and `auto_tuning` with candidate/calibration deltas.
- `npm run deployed:browser:test` can prove whether a hosted URL is a Next.js runtime, GitHub Pages static demo, or broken/unknown deployment surface.
- `npm run topic:matrix:test` can run the real-topic matrix and capture retrieval evidence across eight creator-relevant scenarios.
- `npm run evidence:tuning:test` can consume topic-matrix artifacts and produce `artifacts/evidence-driven-tuning-report.json`.
- Search diagnostics include `evidence_tuning` with query hints, score weights, provider bias, weak metrics, and before/after metric snapshots.
- Search requests can carry `review_evidence_feedback`, and diagnostics include `review_evidence_calibration` with confidence, adjusted result counts, bias hits, and calibration deltas.
- `npm run review:evidence:check` verifies the review-feedback bridge across types, search runtime, static fallback, UI, exports, docs, and QA.

## Release status

`v0.3.1` is the ranking explainability and calibration audit package. It closes the black-box ranking gap introduced by review-driven calibration and makes every ranked result inspectable before the next workflow layer is added.

- v0.3.1 adds `ranking_explainability` diagnostics, per-result `ranking_explanation`, factor-level score breakdowns, review-delta visibility, confidence labels, and export coverage.


## v0.3.1 Project review memory

Project-specific review evidence memory isolates manual-review calibration per project, adds reset/stale diagnostics, and exports memory audit evidence. Validate with `npm run project:review:memory:check`.
