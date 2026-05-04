# Provider Setup — v0.2.9

Visual Research Board must remain usable without API keys. v0.2.9 defaults to free/no-key backend sources, mock fallback, and manual reference-search launchers. It must not scrape Google, Bing, Yandex, or other search-result pages.

## Free core providers

These providers are part of the free backend retrieval core:

| Provider | Key required | Role |
|---|---:|---|
| Mock | No | Offline/demo fallback and deterministic fixtures. |
| Wikimedia Commons | No | Open/reference media, maps, diagrams, public-domain and Creative Commons candidates. |
| Openverse | No | Open-license image discovery across multiple public collections. |
| Library of Congress | No | Historical photos, maps, posters, newspapers, and public-record references. |
| Internet Archive | No | Archive items, scanned material, books, historical media, and metadata. |
| NASA Images | No | Space, earth, aerospace, science, and public-agency imagery. |

## Free-key providers

These are free/open-access sources but require environment keys before they can run in a Next.js runtime deployment:

```bash
SMITHSONIAN_API_KEY=
EUROPEANA_API_KEY=
```

| Provider | Role |
|---|---|
| Smithsonian Open Access | Museum, science, cultural, and public-domain collection imagery. |
| Europeana | European cultural heritage, archive, museum, and library metadata/media. |

## Optional non-core API providers

Brave and Tavily remain optional compatibility providers, but they are disabled by default and are not part of the free-only core.

```bash
BRAVE_SEARCH_API_KEY=
TAVILY_API_KEY=
```

## Reference Search Hub

The Reference Search Hub opens external searches for manual discovery only:

- Google Images
- Bing Images
- DuckDuckGo Images
- Yandex Images
- Startpage Images
- Qwant Images
- Mojeek Images
- Pinterest
- YouTube

The app stores those as launcher links with `fetched_by_tool: false`. The user manually imports selected source URLs. The app must not automatically extract search-engine result pages.

## Mock-only safe mode

Use mock-only mode when validating the UI without network dependencies:

```bash
VISUAL_RESEARCH_BOARD_MOCK_ONLY=true npm run dev
```

Search diagnostics include `mock_only: true`.

## Local smoke checklist

Run:

```bash
npm run qa
npm run free:image:check
npm run typecheck
npm run lint
npm run build
```

Then test these states in the browser:

1. no keys / free-core only
2. mock-only safe mode
3. free-key provider enabled with valid key
4. free-key provider enabled with missing key
5. optional provider disabled by default
6. Reference Search Hub launcher links

## Safety rule

Provider results are source candidates. License labels remain candidates. The app must not claim publication/commercial-use safety without manual source/license verification.
