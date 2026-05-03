# Visual Research Board

`v0.1.0-alpha.8`

A creator-focused, source-aware visual research board for collecting image/web references, preserving source links, organizing references into local projects, importing URLs with metadata, restoring result snapshots, previewing exports before download, and exporting production-ready research packs.

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
→ preview exports before downloading
→ export source-aware production packs or the full local project library
```

## Alpha.8 additions

Reliability pass — no major new product features, focus on correctness, accessibility, and import safety.

- Conflict-safe project library import. Imported libraries are now **merged** into the existing one. Duplicate project IDs are remapped, duplicate names are renamed with an "(imported)" suffix, invalid entries are rejected, and the active project is **never** silently replaced.
- Library import summary panel. Reports imported / renamed / remapped / rejected counts and lists per-entry rejection reasons.
- Export preview drawer. Preview JSON, Markdown, and template exports inline before downloading. Copy-to-clipboard. Escape closes. Empty preview is detected and surfaced before any download.
- Reusable `EmptyState` component. Used by ResultGrid, SearchHistoryPanel, SavedBoard.
- Accessibility pass. Visible focus rings on all interactive controls, ARIA labels on inputs and buttons, `role="dialog"` + `aria-modal` on the export drawer, `role="status"` on import notices, risk labels rendered as text plus color (not color alone), `Escape`-to-close on the drawer.
- New no-browser fixture: `npm run provider:smoke` validates raw provider responses for mock, wikimedia, brave, and tavily.
- New no-browser fixture: `npm run library:conflict:test` exercises the merge import logic against a conflict fixture.
- Schema bumped to `0.1.0-alpha.8` with migration from alpha.5 and alpha.6 storage keys.
- New `docs/browser-qa-checklist.md` for manual sign-off ahead of release candidates.
- Build artifacts (`.next/`, `out/`, `dist/`) are now properly ignored by ESLint.

This release also absorbs the reliability scope originally planned for alpha.7 (UI empty-state component, export preview drawer, conflict-safe import, provider smoke fixture). Alpha.7 was rolled into alpha.8 because the underlying reliability work hadn't yet shipped, and shipping both together avoids a thin point release.

## Alpha.6 baseline (preserved)

- Provider integration hardening. Provider health distinguishes `active`, `no_results`, `missing_key`, `skipped`, `error`, `timeout`.
- Provider health records query samples for debugging.
- Search diagnostics persist provider toggles.
- Persistent result snapshots stored per project.
- Search history entries link to restorable snapshots.
- Restore snapshot action from search history.
- Project-library export and import as JSON.
- Migration from alpha.5 library storage.
- No-browser QA harness with `npm run qa` and `npm run e2e:fixtures`.

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
npm run provider:smoke
npm run library:conflict:test
npm run typecheck
npm run lint
npm run test:ci:no-browser
```

`npm run qa` is dependency-light and runs:

```bash
node tests/qa-check.mjs
node tests/normalization-check.mjs
node tests/e2e-fixture-check.mjs
node tests/provider-smoke-check.mjs
node tests/library-conflict-check.mjs
```

`npm run test:ci:no-browser` additionally runs TypeScript and ESLint after dependencies are installed.

The full pre-release pipeline is:

```bash
npm install
npm run test:ci:no-browser
npm run build
# then walk through docs/browser-qa-checklist.md
```

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
│   ├── SavedBoard.tsx
│   ├── EmptyState.tsx
│   └── ExportPreviewDrawer.tsx
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

docs/
└── browser-qa-checklist.md

tests/
├── qa-check.mjs
├── normalization-check.mjs
├── e2e-fixture-check.mjs
├── provider-smoke-check.mjs
├── library-conflict-check.mjs
└── fixtures/
    ├── normalization-alpha8.json
    ├── project-library-alpha8.json
    ├── project-library-conflict-alpha8.json
    ├── provider-smoke-alpha8.json
    └── (legacy alpha.3-alpha.6 fixtures retained for migration history)
```

## Storage model

Alpha.8 stores a local `ProjectLibrary` in browser `localStorage`:

```text
visual-research-board:project-library:v0.1.0-alpha.8
```

It migrates from:

```text
visual-research-board:project-library:v0.1.0-alpha.6
visual-research-board:project-library:v0.1.0-alpha.5
visual-research-board:active-project:v0.1.0-alpha.4
visual-research-board:saved-results:v0.1.0-alpha.3
visual-research-board:saved-results:v0.1.0-alpha.2
visual-research-board:saved-results:v0.1.0-alpha.1
```

## Library import behaviour

Importing a project library file never replaces the existing one. The merge:

- Keeps every existing project unchanged.
- Adds incoming projects after running them through normalization.
- Remaps incoming project IDs that collide with existing ones to fresh IDs.
- Renames incoming project names that collide (case-insensitive) with the suffix `(imported)` (or `(imported 2)`, `(imported 3)`, …).
- Rejects incoming entries that are not objects or have no name. Reasons are listed in the import summary.
- Preserves the previously active project. Active project only changes if it is missing from the merged library — which should not happen during a normal merge.

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

JSON and CSV export remain available. Every template can also be **previewed inline** before downloading via the export preview drawer.

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

## Acceptance criteria for alpha.8

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
- Export preview drawer surfaces JSON / Markdown / template content with a non-empty check before download.
- Library import merges, never replaces. Duplicate IDs are remapped. Duplicate names are renamed. Invalid entries are reported.
- Library import summary lists imported / renamed / remapped / rejected counts and per-entry rejection reasons.
- Active project remains valid after a library import.
- All interactive controls have visible focus rings, accessible names, and screen-reader-readable status text.
- All empty states are described regions with next-step guidance.
- `npm run typecheck`, `npm run lint`, `npm run qa` all pass clean.
- `npm run provider:smoke` validates each provider's raw fixture shape.
- `npm run library:conflict:test` validates merge counts against the conflict fixture.

## Known limitations

- API keys for Brave / Tavily are not persisted; they must be set as environment variables. The app surfaces `missing_key` rather than failing.
- The metadata extractor is not a crawler — it only fetches the URL the user provides.
- License labels are candidates only. The app cannot confirm commercial use safety.
- Real provider integration (live API calls in CI) is not wired up; only fixture-driven smoke checks ship in alpha.8. Real-provider validation is planned for alpha.9.

## Next logical build

`v0.1.0-alpha.9 — real provider validation, .env.example expansion, provider-specific error UI, mock-only safe mode, API key documentation`
