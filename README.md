# Visual Research Board

`v0.2.7 provider-inspection and manual-review package`

A source-aware visual research workspace for creators, editors, documentary teams, thumbnail designers, and researchers. It turns a topic, person, event, or concept into a curated local reference board with source URLs, provider diagnostics, risk/license candidate labels, notes, board sections, snapshots, and exportable production packs.

## Stable broad-retrieval scope

This release finishes the local MVP. It deliberately avoids login, database, browser automation, full crawling, AI image generation, and team workspace features.

Implemented:

- Next.js App Router, TypeScript, Tailwind dark editorial UI.
- Local project library with create, rename, duplicate, delete, switch, import, and export.
- Search workflow with mode/depth selection, provider toggles, broad image-first query planning, diagnostics, and result snapshots.
- Mock-first operation with no API keys required.
- Optional Wikimedia, Brave, and Tavily provider adapters for Next.js runtime deployments, with broader multi-query image/web retrieval.
- GitHub Pages static-demo mode using client-side mock search and local metadata fallback.
- Result quality layer: source grouping, scoring, broad-result deduplication, saved-first sorting, and “Why this result” explanations.
- Saved board with notes, board sections, manual URL import, metadata fetch/fallback, and persistence.
- Export preview drawer and JSON, Markdown, CSV, attribution, source-audit, production-brief, and moodboard exports.
- Executable QA fixtures for normalization, provider smoke shape, project snapshots, library conflict import, and source invariants.
- Deployment workflows for CI and GitHub Pages static demo.
- Provider runtime readiness endpoint and runtime smoke script for deployed evidence capture.
- Live retrieval quality calibration with creator-gate scoring and runtime artifact capture.
- Retrieval weak-case auto-tuning with tuned query branches, provider/source/license weighting, and diversity-aware reranking.
- Deployed browser evidence capture that classifies hosted builds as Next.js runtime, GitHub Pages static demo, or broken/unknown surface.
- Real-topic test matrix with operational thresholds across historical, documentary, thumbnail, public-domain, news, moodboard, and academic-source scenarios.
- Provider result inspector with provider-level warnings, review candidate IDs, and visual/source/license quality signals.
- Manual quality review loop for saved references with relevance, visual usefulness, source trust, license status, final verdict, reviewer note, and Quality Review export.


## v0.2.7 focus

This package adds provider inspection and human review evidence. Retrieval ranking is no longer treated as sufficient by itself: the app now exposes which providers produced useful candidates and gives saved references an explicit manual review state before export.

## Broad image retrieval boundary

This release is designed to retrieve many more relevant visual/source candidates than the original MVP. It uses broader query planning, multiple query branches, larger provider result windows, Wikimedia multi-query retrieval, Brave image/web expansion, and Tavily image candidates.

It still cannot literally fetch every image on the web. That would require operating a full search-engine crawler and index. The target is broad multi-provider retrieval with source preservation, deduplication, and risk/license labeling.

See `docs/broad-image-retrieval.md`.

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

Create `.env.local` when using real providers in a Next.js runtime deployment:

```bash
VISUAL_RESEARCH_BOARD_MOCK_ONLY=false
BRAVE_SEARCH_API_KEY=
TAVILY_API_KEY=
```

No key is needed for Wikimedia.

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

Static demo mode keeps the UI, mock search, local project library, saved board, snapshots, manual import fallback, and exports. It intentionally disables real provider calls and server-side metadata extraction.

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

## Release status

`v0.2.7` is the provider-inspection and manual-review package. Future work should use provider inspection output and manual review evidence to calibrate actual retrieval quality, not add speculative infrastructure.
