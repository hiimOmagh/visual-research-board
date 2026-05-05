# Visual Research Board v0.6.0

**v0.6.0 — Museum/Open-Access Provider Pack**

Visual Research Board is a free-source visual research workspace for discovering, reviewing, ranking, organizing, and exporting image/source evidence. It prioritizes open/public collections, manual reference-search workflows, rights labels, review-calibrated ranking, claim mapping, coverage audits, and evidence-pack exports.

## Current release

v0.6.0 expands the provider layer with museum, cultural-heritage, digital-library, natural-history, and public-record sources.

### New no-key providers enabled by default

- Met Museum
- Art Institute of Chicago
- Cleveland Museum of Art
- Wellcome Collection
- Biodiversity Heritage Library
- Gallica / BnF
- National Archives / NARA

### New free-key providers disabled by default

- Rijksmuseum: `RIJKSMUSEUM_API_KEY`
- NYPL Digital Collections: `NYPL_API_KEY`
- DPLA: `DPLA_API_KEY`

Existing free/open providers remain available: Wikimedia Commons, Openverse, Library of Congress, Internet Archive, NASA Images, Smithsonian, and Europeana. Brave and Tavily remain optional and disabled by default.

## Core workflow

```text
Search topic
→ retrieve from free/open providers
→ launch external reference searches manually
→ import selected URLs
→ save to board
→ review quality
→ calibrate ranking
→ map sources to claims
→ audit coverage/rights risk
→ export evidence/attribution packs
```

## Validation

```bash
npm run museum:providers:check
npm run qa
```

Full local validation also requires installed dependencies:

```bash
npm run typecheck
npm run lint
```

## Policy boundary

Google, Bing, Yandex, and similar engines are manual reference launchers only. The app does not scrape search-engine results.

## Retained evidence gates

Earlier v0.3.1 evidence gates remain part of the current QA chain. Useful commands:

```bash
npm run deployed:browser:test
npm run topic:matrix:test
```

The current app version is v0.6.0; v0.3.1 references identify retained historical provider/runtime and real-topic evidence gates.
