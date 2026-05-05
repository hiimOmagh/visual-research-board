# Visual Research Board v0.6.1

**v0.6.1 — Stock/Illustrative Provider Pack**

Visual Research Board is a free-source visual research workspace for discovering, reviewing, ranking, organizing, and exporting image/source evidence. It prioritizes open/public collections, manual reference-search workflows, rights labels, review-calibrated ranking, claim mapping, coverage audits, and evidence-pack exports.

## Current release

v0.6.1 adds optional stock/illustrative image providers for moodboards, thumbnails, backgrounds, and visual inspiration. These providers are **free-key**, disabled by default, and explicitly labeled as `stock_illustrative` so they are not confused with factual/archive evidence.

### New optional stock/illustrative providers

- Pixabay: `PIXABAY_API_KEY`
- Pexels: `PEXELS_API_KEY`
- Unsplash: `UNSPLASH_ACCESS_KEY`

### Existing provider foundation

The free/open provider layer remains available:

- Wikimedia Commons
- Openverse
- Library of Congress
- Internet Archive
- NASA Images
- Smithsonian Open Access
- Europeana
- Met Museum
- Art Institute of Chicago
- Cleveland Museum of Art
- Wellcome Collection
- Biodiversity Heritage Library
- Gallica / BnF
- National Archives / NARA
- Rijksmuseum, NYPL, and DPLA when free keys are configured

Brave and Tavily remain optional and disabled by default. Google, Bing, Yandex, and similar search engines remain manual reference launchers only.

## Core workflow

```text
Search topic
→ retrieve from free/open providers
→ optionally add stock/illustrative candidates
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
npm run stock:providers:check
npm run museum:providers:check
npm run qa
```

Full local validation also requires installed dependencies:

```bash
npm run typecheck
npm run lint
```

## Policy boundary

Stock providers are useful for visual inspiration and production illustration, not primary factual evidence. Every stock candidate is labeled with `source_access_mode: stock_illustrative`, `rights_status: likely_reusable`, and `reuse_risk: medium` so users verify terms before publication.

## Retained evidence gates

Earlier v0.3.1 evidence gates remain part of the current QA chain. Useful commands:

```bash
npm run deployed:browser:test
npm run topic:matrix:test
```

The current app version is v0.6.1; v0.3.1 references identify retained historical provider/runtime and real-topic evidence gates.
