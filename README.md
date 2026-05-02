# Visual Research Board

`v0.1.0-alpha.6`

A creator-focused, source-aware visual research board for collecting image/web references, preserving source links, organizing references into local projects, importing URLs with metadata, restoring result snapshots, and exporting production-ready research packs.

## Current scope

This is still an MVP vertical slice. It is not a crawler, not a copyright clearance system, and not a commercial-use license verifier.

The product goal is workflow compression:

```text
Input topic
→ generate query plan
→ collect image/web/source results
→ normalize + score + dedupe
→ save useful references into project boards
→ preserve search/result snapshots
→ add notes/sections/manual imports
→ export source-aware production packs or the full local project library
```

## Alpha.6 additions

- Provider integration hardening.
- Provider health now distinguishes `active`, `no_results`, `missing_key`, `skipped`, `error`, and `timeout`.
- Provider health records query samples for debugging.
- Search diagnostics persist provider toggles.
- Persistent result snapshots stored per project.
- Search history entries link to restorable snapshots.
- Restore snapshot action from search history.
- Project-library export as JSON.
- Project-library import from JSON.
- Migration from alpha.5 library storage.
- Stronger no-browser QA harness.
- End-to-end fixture check: `npm run e2e:fixtures`.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The app works without API keys because mock data is enabled by default.

## Optional API keys

Create `.env.local`:

```bash
BRAVE_SEARCH_API_KEY=
TAVILY_API_KEY=
```

Without keys:

- Mock provider works.
- Wikimedia provider can run when targeted.
- Brave and Tavily report `missing_key` in provider health.

## Scripts

```bash
npm run qa
npm run normalization:test
npm run e2e:fixtures
npm run typecheck
npm run lint
npm run test:ci:no-browser
```

`npm run qa` is dependency-light and runs:

```bash
node tests/qa-check.mjs
node tests/normalization-check.mjs
node tests/e2e-fixture-check.mjs
```

`npm run test:ci:no-browser` additionally runs TypeScript and ESLint after dependencies are installed.

## Folder structure

```text
src/
├── app/
│   ├── api/
│   │   ├── search/route.ts
│   │   ├── metadata/route.ts
│   │   └── export/route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/search/
│   ├── SearchPanel.tsx
│   ├── ProjectLibraryPanel.tsx
│   ├── ProviderTogglePanel.tsx
│   ├── ProviderHealthPanel.tsx
│   ├── SearchHistoryPanel.tsx
│   ├── ResultFilters.tsx
│   ├── ResultGrid.tsx
│   ├── ResultCard.tsx
│   ├── ResultDetailPanel.tsx
│   └── SavedBoard.tsx
│
├── lib/
│   ├── query-planner.ts
│   ├── result-normalizer.ts
│   ├── scoring.ts
│   ├── risk.ts
│   ├── export.ts
│   ├── local-storage.ts
│   ├── manual-import.ts
│   ├── project.ts
│   └── providers/
│       ├── mock.ts
│       ├── brave.ts
│       ├── tavily.ts
│       ├── wikimedia.ts
│       └── provider-utils.ts
│
├── types/research.ts
└── tests/
    ├── qa-check.mjs
    ├── normalization-check.mjs
    ├── e2e-fixture-check.mjs
    └── fixtures/
```

## Storage model

Alpha.6 stores a local `ProjectLibrary` in browser `localStorage`:

```text
visual-research-board:project-library:v0.1.0-alpha.6
```

It migrates from:

```text
visual-research-board:project-library:v0.1.0-alpha.5
visual-research-board:active-project:v0.1.0-alpha.4
visual-research-board:saved-results:v0.1.0-alpha.3
visual-research-board:saved-results:v0.1.0-alpha.2
visual-research-board:saved-results:v0.1.0-alpha.1
```

## Project model

Each project contains:

```text
ResearchProject
├── board_sections
├── saved_results
├── search_history
└── result_snapshots
```

Search history entries are lightweight records. Result snapshots store the actual response state needed to restore a prior search result board.

## Provider behavior

Provider toggles allow local control over:

- Mock
- Wikimedia
- Brave
- Tavily

Search provider health reports:

- active
- no_results
- missing_key
- skipped
- error
- timeout

Each provider health record includes:

- provider name
- status
- enabled flag
- result count
- duration
- queries used
- query sample
- optional diagnostic message

## Metadata extraction

`POST /api/metadata`

Input:

```json
{
  "url": "https://example.com/source-page"
}
```

Output:

```json
{
  "url": "https://example.com/source-page",
  "source_domain": "example.com",
  "title": "Example title",
  "description": "Optional description",
  "thumbnail_url": "https://example.com/image.jpg",
  "fetched_at": "2026-05-02T00:00:00.000Z",
  "status": "ok"
}
```

The extractor reads HTML metadata such as:

- `<title>`
- `og:title`
- `og:description`
- `og:image`
- `twitter:title`
- `twitter:description`
- `twitter:image`

It does not crawl sites. It only fetches the provided URL and extracts page-level metadata.

## Export templates

Available Markdown templates:

| Template | Use |
|---|---|
| Source Audit | Verification-oriented source list. |
| Production Brief | Creator-facing planning brief grouped by board section. |
| Visual Moodboard | Image-first board with thumbnails and notes. |
| Attribution Pack | Draft attribution lines requiring verification. |

JSON and CSV export remain available.

Project library export produces a JSON bundle containing all local projects, saved results, search history, result snapshots, and board sections.

## Risk and license warning

The app uses cautious labels:

- Public-domain candidate
- Creative Commons candidate
- Unknown license
- Unclear license
- Likely copyrighted
- Low risk candidate
- Needs verification
- High risk
- Reference only
- Avoid

The app does **not** claim commercial-use safety. Always verify the source page and license terms before publication.

## Acceptance criteria for alpha.6

- App runs without API keys using mock provider data.
- User can create, switch, duplicate, rename, delete, export, and import local projects.
- Saved board remains project-specific.
- Search history remains project-specific.
- Search history entries store snapshot IDs.
- Result snapshots can be restored from the active project.
- Provider health includes `no_results` and query samples.
- Search diagnostics persist provider toggles.
- Manual import can fetch metadata from a provided URL.
- Manual import can still be completed without metadata extraction.
- Saved notes and board sections persist.
- Export templates work from saved items.
- JSON, Markdown, CSV, attribution, and full library exports remain available.
- Normalization fixture test runs with `npm run normalization:test`.
- End-to-end fixture test runs with `npm run e2e:fixtures`.
- QA runs with `npm run qa`.

## Next logical build

`v0.1.0-alpha.7 — UI reliability pass + empty-state polish + project import conflict handling + API provider smoke fixtures + export preview drawer`
