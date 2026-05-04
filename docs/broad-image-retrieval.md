# Broad Image Retrieval — Visual Research Board v0.3.0

## What changed

The app no longer treats search as a small sample. Runtime provider searches now use a broader image-first retrieval strategy:

- more query branches per research depth
- more visual query expansions per mode
- Wikimedia Commons searches across multiple query branches, not only the first query
- Brave image search uses larger result windows and offset pagination
- Brave web search uses broader source discovery
- Tavily requests image candidates when image targets are relevant
- provider calls are concurrency-limited to reduce avoidable timeout/rate-limit failures
- normalization and deduplication remain active so broad retrieval does not flood the board with near-duplicates

## Important boundary

The app cannot literally fetch "all images on the web." No normal product can exhaust the whole web without operating a search index/crawler at search-engine scale. The implemented target is:

```text
broad multi-provider retrieval → many more relevant candidates → source-preserved → deduped → risk-labeled → export-ready
```

## Practical behavior by depth

```text
Quick:    fast sample across 2 query branches
Standard: balanced coverage across 5 query branches
Deep:     maximum local coverage across 8 query branches plus larger provider windows
```

## Provider behavior

- Mock: deterministic demo references, always available
- Wikimedia: broad Commons retrieval, no API key
- Brave: broad image/web retrieval, requires BRAVE_SEARCH_API_KEY
- Tavily: broad web retrieval plus image candidates, requires TAVILY_API_KEY

## License safety

Broad retrieval increases recall, not license certainty. Every broad-web image remains a candidate and must be manually verified before commercial publication.
