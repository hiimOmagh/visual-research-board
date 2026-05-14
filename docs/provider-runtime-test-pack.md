# Provider Runtime Test Pack — v2.1.4

`v2.1.4` adds an explicit runtime validation layer for real-provider evidence. The goal is to separate three different states:

1. **GitHub Pages static demo** — client-side mock only.
2. **Next.js runtime without keys** — Wikimedia can run; Brave/Tavily report `missing_key`.
3. **Next.js runtime with keys** — Brave, Tavily, Wikimedia, and mock can all be tested through `/api/search`.

## Runtime readiness endpoint

The app exposes:

```text
GET /api/provider-runtime
```

It returns a safe, no-secret report with:

```text
app_version
runtime_host
mock_only
live_provider_ready_count
provider readiness states
recommended_next_steps
```

Provider readiness states:

```text
configured
available_no_key_needed
missing_key
forced_mock_disabled
static_demo_disabled
```

## Runtime smoke command

Start the app or deploy it first, then run:

```bash
npm run provider:runtime:test
```

By default the script targets:

```text
http://localhost:3000
```

To test a deployed runtime:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-vercel-app.vercel.app npm run provider:runtime:test
```

The command writes:

```text
artifacts/provider-runtime-evidence.json
```

The artifact contains:

```text
runtime endpoint result
search case count
provider status counts
active real providers
retrieval evidence per case
warnings/failures
```

## Strict real-provider gate

To fail when no real provider is active:

```bash
VISUAL_RESEARCH_BOARD_REQUIRE_REAL_PROVIDERS=true \
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-vercel-app.vercel.app \
npm run provider:runtime:test
```

Use this strict mode only after keys are configured.

## Runtime topics fixture

The default fixture is:

```text
tests/fixtures/provider-runtime-topics.json
```

It includes historical, public-domain, thumbnail, and academic-source-pack test cases. Override it with:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_TOPICS_FILE=tests/fixtures/provider-runtime-topics.json npm run provider:runtime:test
```

## Acceptance target

For a credible provider-backed retrieval pass:

```text
- /api/provider-runtime responds successfully
- /api/search responds successfully for every fixture case
- deep mode reaches the target candidate count
- at least one real provider is active when strict mode is enabled
- every result keeps source URL, provider, risk/license candidate labels, and retrieval evidence
```

## Boundary

This does not prove that the app fetches the whole web. It proves runtime provider execution, result breadth, source preservation, and measurable retrieval evidence against representative creator topics.
