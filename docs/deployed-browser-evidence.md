# Deployed Browser Evidence — v0.2.6

`v0.2.6` adds a deployment evidence pack so a hosted build can be checked without guessing whether the user is looking at the real app, a static demo, or a broken documentation page.

## Purpose

The package separates three deployment states:

```text
next_runtime     = app shell loads and API routes respond
static_demo      = app shell loads but API routes are unavailable, acceptable only for GitHub Pages mock demo
unknown_or_broken = homepage/API checks fail or do not resemble the Visual Research Board app
```

## Runtime command

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-deployed-url.example npm run deployed:browser:test
```

For strict Next.js runtime validation:

```bash
VISUAL_RESEARCH_BOARD_REQUIRE_NEXT_RUNTIME=true \
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-vercel-app.vercel.app \
npm run deployed:browser:test
```

## Artifact

The command writes:

```text
artifacts/deployed-browser-evidence.json
```

GitHub Pages should classify as `static_demo` because Pages cannot run Next.js API routes. Vercel or another Next.js runtime should classify as `next_runtime` because `/api/provider-runtime` and `/api/search` should respond.
