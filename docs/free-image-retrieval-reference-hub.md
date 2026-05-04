# Free Image Retrieval + Reference Search Hub — v0.2.10

`v0.2.10` expands the Visual Research Board from a narrow provider stack into a free-source image discovery workflow.

## Backend-free providers

The free-core backend providers are:

- Wikimedia Commons — free, no key.
- Openverse — free, no key.
- Library of Congress — free, no key.
- Internet Archive — free, no key for metadata/search.
- NASA Images — free, no key.
- Smithsonian Open Access — free key required through `SMITHSONIAN_API_KEY`.
- Europeana — free key required through `EUROPEANA_API_KEY`.

Brave and Tavily remain optional API providers, but they are disabled by default and are not part of the free-only core.

## Reference Search Hub

The Reference Search Hub creates launcher links for Google Images, Bing Images, DuckDuckGo Images, Yandex Images, Startpage Images, Qwant Images, Mojeek, Pinterest, and YouTube.

These links are manual discovery surfaces only: **no automated Google/Bing/Yandex scraping** is performed. The user opens a search result manually and imports selected URLs through the existing manual import workflow.

## Rights labels

Every normalized result now carries:

- `source_access_mode`
- `rights_status`
- `reuse_risk`

Exports include these fields so reusable, check-required, and reference-only material remain separate.

## Validation

Run:

```bash
npm run free:image:check
npm run qa
```
