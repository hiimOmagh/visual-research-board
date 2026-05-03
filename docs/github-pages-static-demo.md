# GitHub Pages static demo

Visual Research Board is primarily a Next.js app with API routes. GitHub Pages cannot run those API routes.

This repository includes a constrained static demo mode for GitHub Pages. It keeps the UI, local project library, mock search, saved board, notes, sections, snapshots, manual URL import, and exports. It intentionally disables real provider calls and server-side metadata extraction.

## What works in static demo mode

- App shell and dark workspace UI
- Client-side mock search
- Local project library persistence
- Saved results
- Notes and board sections
- Search history and snapshot restore
- Manual URL import with local fallback metadata
- JSON, Markdown, CSV, attribution, and template exports

## What does not work in static demo mode

- `/api/search`
- `/api/metadata`
- `/api/export`
- Brave provider calls
- Tavily provider calls
- Wikimedia provider calls
- Server-side URL metadata extraction

Use Vercel or another Next.js-compatible host for provider-backed runtime behavior.

## Build for GitHub Pages

For a project page such as `https://USERNAME.github.io/visual-research-board/`:

```bash
VISUAL_RESEARCH_BOARD_STATIC_EXPORT=true \
NEXT_PUBLIC_VISUAL_RESEARCH_BOARD_STATIC_DEMO=true \
VISUAL_RESEARCH_BOARD_BASE_PATH=/visual-research-board \
npm run build
```

Deploy the generated `out/` directory to GitHub Pages.

For a root GitHub Pages site or custom domain, omit `VISUAL_RESEARCH_BOARD_BASE_PATH`:

```bash
VISUAL_RESEARCH_BOARD_STATIC_EXPORT=true \
NEXT_PUBLIC_VISUAL_RESEARCH_BOARD_STATIC_DEMO=true \
npm run build
```

## Recommended production path

```text
GitHub repository = source code
GitHub Pages = optional static demo / public documentation
Vercel = real Next.js app runtime
```
