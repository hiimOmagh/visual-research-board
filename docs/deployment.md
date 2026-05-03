# Deployment — Visual Research Board v0.2.1

Visual Research Board has two valid deployment modes.

## 1. Next.js runtime deployment

Use this for real provider-backed behavior and API routes.

Recommended host: Vercel.

```bash
npm install
npm run qa
npm run typecheck
npm run lint
npm run build
```

Runtime features:

- `/api/search`
- `/api/metadata`
- `/api/export`
- Wikimedia provider
- Brave provider when `BRAVE_SEARCH_API_KEY` is set
- Tavily provider when `TAVILY_API_KEY` is set
- server-side mock-only mode via `VISUAL_RESEARCH_BOARD_MOCK_ONLY=true`

## 2. GitHub Pages static demo

Use this for a public mock-only demo. GitHub Pages cannot run Next.js API routes.

Project page:

```bash
VISUAL_RESEARCH_BOARD_BASE_PATH=/visual-research-board npm run build:static:pages
```

Root/custom-domain page:

```bash
npm run build:static
```

Deploy the generated `out/` directory.

The static build script temporarily disables `src/app/api` during export and restores it after the build. This prevents static-export incompatibility with runtime route handlers while preserving the full source tree for Vercel/runtime deployments.

## GitHub Actions

Included workflows:

- `.github/workflows/ci.yml` — QA, typecheck, lint, runtime build.
- `.github/workflows/pages-static-demo.yml` — builds and deploys the static demo to GitHub Pages.

For Pages, set repository Pages source to **GitHub Actions**.
