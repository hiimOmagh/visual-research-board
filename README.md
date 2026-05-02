# Visual Research Board

`v0.1.0-alpha.4`

A source-aware visual research board for creators. It converts a topic/person/event into a query plan, normalized result cards, filtered boards, saved references, editable notes, manual source imports, attribution packs, provider diagnostics, project search history, board sections, and exportable JSON/Markdown/CSV packs.

## What is included

- Next.js App Router + TypeScript + Tailwind
- Topic input
- Research mode selector
- Search depth selector
- Project object stored in localStorage
- Project rename and new-project reset
- Search history stored per project
- Board sections with per-item section assignment
- Provider toggles for mock, Wikimedia, Brave, and Tavily
- Generated search plan panel
- Mock provider data so the app works without API keys
- Provider health panel showing active/skipped/missing-key providers
- Optional provider adapters for:
  - Wikimedia Commons
  - Brave Image Search
  - Brave Web Search
  - Tavily Search
- Improved Wikimedia metadata extraction using imageinfo/extmetadata
- Normalized result cards
- Better deduplication and score sorting
- Source/risk/license/provider/type filters
- Risk and license labels
- Source URL preservation
- Saved board with project-level localStorage persistence
- Editable notes per saved item
- Manual URL import
- Per-item attribution copy
- Attribution pack export
- JSON export
- Markdown export
- CSV export
- API route: `POST /api/search`
- API route: `POST /api/export`
- QA harness: `npm run qa`
- No-browser CI script: `npm run test:ci:no-browser`

## What is intentionally excluded

- Login/auth
- Database
- Team workspace
- Full web crawler
- Browser automation
- AI image generation
- Full copyright verification
- Automatic commercial-use claims

## Setup

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Optional API keys

The app works without keys because mock results are enabled by default.

To enable external providers, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then add:

```bash
BRAVE_SEARCH_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
```

## Available scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run qa
npm run test:ci:no-browser
```

`npm run qa` is dependency-light and checks the alpha.4 structure, versioning, project objects, search history, board sections, provider toggles, export schema, manual-import feature, attribution generator, and legacy localStorage migration. `npm run test:ci:no-browser` also runs TypeScript and ESLint after dependencies are installed.

## Core workflow

```text
Create or rename project
→ input topic
→ choose mode
→ choose depth
→ choose provider toggles
→ generate search plan
→ collect mock / provider results
→ normalize metadata
→ deduplicate
→ score and sort
→ filter by risk/license/provider/type/source
→ show visual board
→ record search history in project
→ save selected results
→ assign board sections
→ edit production notes
→ import manual URLs when needed
→ export JSON, Markdown, CSV, or attribution pack
```

## Project object model

Alpha.4 stores one active project in localStorage:

```text
ResearchProject
├── board_sections
├── saved_results
└── search_history
```

This is the main structural upgrade from alpha.3. Saved items are no longer isolated localStorage entries; they belong to a project with sections and history.

## Provider toggles

The Provider Toggles panel lets you disable noisy providers while testing:

- Mock
- Wikimedia
- Brave
- Tavily

If all providers are switched off, mock is automatically re-enabled so the app remains testable.

## Board sections

The saved board includes default sections:

- Inbox
- Public-domain / CC candidates
- Thumbnail / production ideas

You can add more sections and assign saved items to them. This is still intentionally lightweight; drag-and-drop is deferred.

## Manual URL import

The manual import form lets you add sources that were not returned by the search providers. It stores:

- source URL
- optional title
- optional thumbnail URL
- result type
- cautious license label
- note

Manual imports are tagged as `manual-import` and `source-check-needed`.

## Attribution generator

The attribution pack creates draft attribution lines for every saved item. These lines are drafting aids only; they do not guarantee publication or commercial-use safety.

## Risk policy

This project does not claim that any image is commercially safe. It uses cautious labels such as:

- Public-domain candidate
- Creative Commons candidate
- Unknown license
- Unclear license
- Reference only
- High risk

Always verify source pages and license terms before direct use, publication, or commercial work.

## v0.1.0-alpha.4 changes

- Added project objects.
- Added active project storage and migration from legacy saved-result keys.
- Added project rename and new-project reset.
- Added per-project search history.
- Added board sections.
- Added per-item section assignment.
- Added provider toggles.
- Updated `/api/search` to accept `provider_toggles`.
- Updated JSON/Markdown exports to include project/section context.
- Added stronger QA checks and alpha.4 project fixture.
- Updated README and version metadata.

## Recommended next milestone

`v0.1.0-alpha.5` should add:

- Project library with multiple saved projects instead of one active project.
- URL metadata extraction for manual imports.
- Export templates for YouTube/documentary/source-audit packs.
- Result comparison drawer.
- Better normalization tests using executable fixtures.
- Optional drag-and-drop section ordering.
