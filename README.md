# Visual Research Board

`v0.1.0-alpha.1`

A mock-first, source-aware visual research board for creators. It converts a topic/person/event into a query plan, normalized result cards, saved references, and exportable JSON/Markdown packs.

## What is included

- Next.js App Router + TypeScript + Tailwind
- Topic input
- Research mode selector
- Search depth selector
- Generated search plan panel
- Mock provider data so the app works without API keys
- Optional provider adapters for:
  - Wikimedia Commons
  - Brave Image Search
  - Brave Web Search
  - Tavily Search
- Normalized result cards
- Risk and license labels
- Source URL preservation
- Saved board with localStorage persistence
- JSON export
- Markdown export
- API route: `POST /api/search`
- API route: `POST /api/export`

## What is intentionally excluded in v0.1.0

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
→ score lightly
→ show visual board
→ save selected results
→ export JSON or Markdown
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

## Recommended next milestone

`v0.1.0-alpha.2` should add:

- Source/risk filters
- Better grouping by result type
- Stronger deduplication
- Better Wikimedia license extraction
- API health panel showing which providers are active
