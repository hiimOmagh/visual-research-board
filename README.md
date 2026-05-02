# Visual Research Board

`v0.1.0-alpha.2`

A source-aware visual research board for creators. It converts a topic/person/event into a query plan, normalized result cards, filtered boards, saved references, provider diagnostics, and exportable JSON/Markdown/CSV packs.

## What is included

- Next.js App Router + TypeScript + Tailwind
- Topic input
- Research mode selector
- Search depth selector
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
- Saved board with localStorage persistence
- JSON export
- Markdown export
- CSV export
- API route: `POST /api/search`
- API route: `POST /api/export`

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

The app works without keys because mock results are always returned.

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
```

## Core workflow

```text
Input topic
→ choose mode
→ choose depth
→ generate search plan
→ collect mock / provider results
→ normalize metadata
→ deduplicate
→ score and sort
→ filter by risk/license/provider/type/source
→ show visual board
→ save selected results
→ export JSON, Markdown, or CSV
```

## Risk policy

This project does not claim that any image is commercially safe. It uses cautious labels such as:

- Public-domain candidate
- Creative Commons candidate
- Unknown license
- Unclear license
- Reference only
- High risk

Always verify source pages and license terms before direct use, publication, or commercial work.

## v0.1.0-alpha.2 changes

- Added provider health diagnostics.
- Added result filtering.
- Added grouped result display.
- Added overall scoring.
- Added stronger source/risk scoring.
- Added CSV export.
- Added Wikimedia license metadata extraction.
- Added better deduplication.
- Updated localStorage key for alpha.2.

## Recommended next milestone

`v0.1.0-alpha.3` should add:

- Real provider QA with your API keys.
- Search history per project.
- Editable notes per saved item.
- Manual URL import.
- Attribution generator.
- Basic automated test suite for scoring/export/normalization.
