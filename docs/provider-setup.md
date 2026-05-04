# Provider Setup — v0.2.8

Visual Research Board must remain usable without API keys. Real providers are optional local integrations.

## Mock-only safe mode

Use `VISUAL_RESEARCH_BOARD_MOCK_ONLY=true npm run dev` to force server-side mock-only execution. Search diagnostics include `mock_only: true`.

## Brave setup

Set `BRAVE_SEARCH_API_KEY` in `.env.local`. Brave uses `api.search.brave.com/res/v1/images/search` and `api.search.brave.com/res/v1/web/search`. Missing keys report `missing_env: BRAVE_SEARCH_API_KEY`.

## Tavily setup

Set `TAVILY_API_KEY` in `.env.local`. Tavily uses `api.tavily.com/search`. Missing keys report `missing_env: TAVILY_API_KEY`.

## Wikimedia setup

No API key is required. Commons calls use `commons.wikimedia.org/w/api.php`.

## Local smoke checklist

Run `npm run qa`, `npm run typecheck`, `npm run lint`, and `npm run build`, then test no-key, mock-only, valid-key, and Invalid key behavior states in the browser.

## Safety rule

Provider results are references. License labels remain candidates. The app must not claim commercial-use safety without manual source/license verification.
