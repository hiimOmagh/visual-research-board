# Visual Research Board v1.0.0

**v1.0.0 — Security and Key Handling**

Visual Research Board is a free-source visual research workspace for discovering, reviewing, ranking, organizing, and exporting image/source evidence. It prioritizes open/public collections, manual reference-search workflows, rights labels, review-calibrated ranking, claim mapping, coverage audits, attribution generation, and evidence-pack exports.

## Current release

v1.0.0 does not add another product feature. It hardens the release process with a consolidated **Security and Key Handling**.

The gate replaces a fragile one-line `npm run qa` chain with a categorized runner that executes deterministic checks, records pass/fail evidence, and writes:

```text
artifacts/full-qa-gate-report.json
```

## QA commands

```bash
npm run qa
npm run qa:list
npm run qa:baseline
npm run qa:retrieval
npm run qa:providers
npm run qa:workflow
npm run qa:exports
npm run qa:release
npm run full:qa:check
```

The no-browser CI gate remains:

```bash
npm run test:ci:no-browser
```

That command runs:

```text
Security and Key Handling → Typecheck → Lint
```

## QA categories

| Category | Purpose |
|---|---|
| baseline | Core static checks, fixtures, lockfile, library conflict handling. |
| retrieval | Retrieval evidence, query routing, calibration, dedupe, ranking explainability. |
| providers | Runtime/provider diagnostics, free/open museum pack, stock/illustrative pack. |
| workflow | Manual review, review memory, board organization, claims, coverage, UX, storage. |
| exports | Evidence pack and attribution generator checks. |
| release | Browser-evidence fixtures and full QA manifest integrity. |

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

## Provider foundation

The free/open provider layer includes Wikimedia Commons, Openverse, Library of Congress, Internet Archive, NASA Images, Smithsonian Open Access, Europeana, Met Museum, Art Institute of Chicago, Cleveland Museum of Art, Wellcome Collection, Biodiversity Heritage Library, Gallica/BnF, NARA, and optional free-key providers such as Rijksmuseum, NYPL, DPLA, Pixabay, Pexels, and Unsplash.

Brave and Tavily remain optional and disabled by default. Google, Bing, Yandex, and similar search engines remain manual reference launchers only.

## Release rule

v1.0.0 is a validation-hardening release. A successful release needs:

```bash
npm run qa
npm run typecheck
npm run lint
npm run build
```

CI uploads the full QA evidence artifact so failed or passed runs can be inspected without guessing which gate executed.

## Retained evidence gates

The current app version is v1.0.0. Some retained evidence docs and fixture gates still identify v0.3.1 because they validate historical provider/runtime and real-topic evidence behavior that remains active.

```bash
npm run deployed:browser:test
npm run topic:matrix:test
```

## v1.0.0 security validation

```bash
npm run security:key:check
npm run qa:security
npm run qa
```

Provider keys are server-only and diagnostics report only redacted presence. Do not create `NEXT_PUBLIC_*API_KEY`, `NEXT_PUBLIC_*ACCESS_KEY`, `NEXT_PUBLIC_*TOKEN`, or `NEXT_PUBLIC_*SECRET` variables.

## Public Demo Release Candidate

The current target is **v1.0.0 — Public Demo Release Candidate**.

This release hardens the app for public inspection. It does not add live scraping, production OAuth, paid-provider assumptions, or fake-live provider behavior.

The public demo must remain usable without private credentials. Provider keys are optional and must remain server-only. Attribution and rights labels are assistance layers, not legal clearance.

Run:

```bash
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
```

## Public Demo Evidence Lock

The current target is **v1.0.0 — Public Demo Evidence Lock**.

This patch locks release evidence for the public demo. It does not add features, providers, scraping behavior, OAuth, or source-verification guarantees.

Run:

```bash
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## Hosted Demo Evidence Review

The current target is **v1.0.0 — Hosted Demo Evidence Review**.

This release adds a deterministic hosted-demo evidence-review gate and documentation. It does not add feature, provider, retrieval, or export behavior changes.

Run:

```bash
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa
```

## Public Demo Final Acceptance

The current target is **v1.0.0 — Public Demo Final Acceptance**.

This release finalizes public-demo acceptance before the stable public-demo release. It does not add feature, provider, retrieval, or export behavior changes.

Run:

```bash
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa
```

## Public Demo Stable Release

The current release is **v1.0.0 — Public Demo Stable Release**.

This release locks the public demo stable baseline. It does not add feature, provider, retrieval, export, social, book, or generation behavior changes.

Run:

```bash
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa
```
