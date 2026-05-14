# Visual Research Board v2.1.3

**v2.1.3 — Security and Key Handling**

Visual Research Board is a free-source visual research workspace for discovering, reviewing, ranking, organizing, and exporting image/source evidence. It prioritizes open/public collections, manual reference-search workflows, rights labels, review-calibrated ranking, claim mapping, coverage audits, attribution generation, and evidence-pack exports.

## Current release

v2.1.3 does not add another product feature. It hardens the release process with a consolidated **Security and Key Handling**.

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

v2.1.3 is a validation-hardening release. A successful release needs:

```bash
npm run qa
npm run typecheck
npm run lint
npm run build
```

CI uploads the full QA evidence artifact so failed or passed runs can be inspected without guessing which gate executed.

## Retained evidence gates

The current app version is v2.1.3. Some retained evidence docs and fixture gates still identify v0.3.1 because they validate historical provider/runtime and real-topic evidence behavior that remains active.

```bash
npm run deployed:browser:test
npm run topic:matrix:test
```

## v2.1.3 security validation

```bash
npm run security:key:check
npm run qa:security
npm run qa
```

Provider keys are server-only and diagnostics report only redacted presence. Do not create `NEXT_PUBLIC_*API_KEY`, `NEXT_PUBLIC_*ACCESS_KEY`, `NEXT_PUBLIC_*TOKEN`, or `NEXT_PUBLIC_*SECRET` variables.

## Public Demo Release Candidate

The current target is **v2.1.3 — Public Demo Release Candidate**.

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

The current target is **v2.1.3 — Public Demo Evidence Lock**.

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

The current target is **v2.1.3 — Hosted Demo Evidence Review**.

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

The current target is **v2.1.3 — Public Demo Final Acceptance**.

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

The current release is **v2.1.3 — Public Demo Stable Release**.

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

## Reference Intelligence Layer MVP

The current release is **v2.1.3 — Reference Intelligence Layer MVP**.

This release starts the product-expansion track after the public demo stable release. It adds reference-use metadata, role labels, access/risk context, and interpretation helpers.

It does not change provider behavior, retrieval logic, export behavior, social search, book search, or generation behavior.

Run:

```bash
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run qa
```

## Broad Reference Result Model

The current release is **v2.1.3 — Broad Reference Result Model**.

This release makes broad reference source classes first-class. Search results can now be modeled as web images, web pages, social media, books, archives, museums, stock/illustrative results, video, or unknown sources.

It does not add new providers, retrieval logic, social search, book search, generation behavior, or export behavior changes.

Run:

```bash
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run qa
```

## Broad Web + Image Discovery Expansion

The current release is **v2.1.3 — Broad Web + Image Discovery Expansion**.

This release adds broad web/image discovery mode planning and maps discovery candidates into `BroadReferenceResult`.

It does not add providers, scraping, dedicated social search, dedicated book search, generation behavior, or export behavior changes.

Run:

```bash
npm run broad-discovery:check
npm run broad-reference:model:check
npm run qa
```

## Social Reference Discovery Layer

The current release is **v2.1.3 — Social Reference Discovery Layer**.

This release adds public social-reference discovery planning and classification into `BroadReferenceResult` with `source_class: social_media`.

It does not add account-gated scraping, login bypass, hidden API abuse, media rehosting, dedicated social providers, book search, generation behavior, or export behavior changes.

Run:

```bash
npm run social-reference:check
npm run broad-discovery:check
npm run qa
```

## Book / Bibliographic Discovery Layer

The current release is **v2.1.3 — Book / Bibliographic Discovery Layer**.

This release adds metadata-first book, ISBN, catalog, preview, archive, and bibliography classification into `BroadReferenceResult` with `source_class: book`.

It does not add copyrighted text extraction, full-text scraping, paywall bypass, access circumvention, generation behavior, or export behavior changes.

Run:

```bash
npm run book-reference:check
npm run social-reference:check
npm run qa
```

## Reference Activation Pack MVP

The current release is **v2.1.3 — Reference Activation Pack MVP**.

This release turns gathered references into activation-ready metadata and brief-text packs with source roles, visual direction, research context, risk/access notes, and next steps.

It does not add image generation, scraping, copyrighted text extraction, paywall bypass, access circumvention, or broad export behavior changes.

Run:

```bash
npm run reference-activation:check
npm run book-reference:check
npm run qa
```

## Activation Pack UI Integration

The current release is **v2.1.3 — Activation Pack UI Integration**.

This release exposes activation packs in a visible board workflow using already-gathered references. It supports full-board and selected-reference activation states.

It does not add image generation, scraping, copyrighted text extraction, paywall bypass, access circumvention, or export behavior changes.

Run:

```bash
npm run activation-pack:ui:check
npm run reference-activation:check
npm run qa
```

## Activation Pack Export Preview

The current release is **v2.1.3 — Activation Pack Export Preview**.

This release previews activation packs as structured Markdown or JSON text before future export workflow expansion.

It does not add broad export system rewrites, file download expansion, new download behavior, image generation, scraping, copyrighted text extraction, paywall bypass, or access circumvention.

Run:

```bash
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run qa
```

## Activation Pack Export Integration

The current release is **v2.1.3 — Activation Pack Export Integration**.

This release connects activation pack Markdown/JSON preview output to existing text download utilities for metadata/brief-text export only.

It does not add export system rewrites, broad export expansion, scraping, image generation, copyrighted text extraction, paywall bypass, access circumvention, or source media rehosting.

Run:

```bash
npm run activation-pack:export:check
npm run activation-pack:export-preview:check
npm run qa
```

## Reference Workflow Stable Release

The current release is **v2.1.3 — Reference Workflow Stable Release**.

This stable release consolidates the full discovery → board → activation → export workflow.

It does not add new feature expansion, scraping, image generation, copyrighted text extraction, paywall bypass, access circumvention, provider expansion, export rewrites, or source media rehosting.

Run:

```bash
npm run reference-workflow:stable:check
npm run activation-pack:export:check
npm run qa
```

## Stable Release Hygiene + Audit Warning Review

The current release is **v2.1.3 — Stable Release Hygiene + Audit Warning Review**.

This patch audits the 2 moderate npm audit warnings without force-fixing, guards generated/cache artifacts, verifies release docs/screenshots/tag guidance, and preserves the v2 stable workflow.

It does not add new features, dependency churn, provider expansion, export rewrites, scraping, image generation, copyrighted text extraction, paywall bypass, or source media rehosting.

Run:

```bash
npm run stable:hygiene:check
npm run reference-workflow:stable:check
npm run qa
```

## Dependency Audit Triage

The current release is **v2.1.3 — Dependency Audit Triage**.

This patch documents and gates triage for the 2 moderate npm audit warnings. It separates direct vs transitive dependency risk, runtime vs dev-only exposure, patched versions, and non-breaking update options.

It does not run `npm audit fix --force`, change dependency versions blindly, add features, expand providers, rewrite exports, scrape, generate images, extract copyrighted text, bypass paywalls, or rehost source media.

Run:

```bash
npm run dependency:audit:triage:check
npm run stable:hygiene:check
npm run qa
```

## Public Demo Evidence + Screenshot Lock

The current release is **v2.1.3 — Public Demo Evidence + Screenshot Lock**.

This patch locks the public demo screenshot evidence checklist for the stable discovery → board → activation → export workflow.

It does not add new features, dependency churn, provider expansion, export rewrites, scraping, image generation, copyrighted text extraction, paywall bypass, or source media rehosting.

Run:

```bash
npm run public-demo:screenshot:check
npm run dependency:audit:triage:check
npm run qa
```

## Release Package Audit

The current release is **v2.1.3 — Release Package Audit**.

This patch audits package metadata, version consistency, tag guidance, release docs, committed artifact boundaries, and final release checklist integrity.

It does not add new features, dependency churn, provider expansion, export rewrites, scraping, image generation, copyrighted text extraction, paywall bypass, or source media rehosting.

Run:

```bash
npm run release:package:audit:check
npm run public-demo:screenshot:check
npm run qa
```

## Unified Release Verification Runner

The current release is **v2.1.3 — Unified Release Verification Runner**.

Use one command for local release verification:

```bash
npm run verify:release
```

Use a clean install plus verification path for CI parity:

```bash
npm run verify:ci-parity
```

The runner writes `artifacts/release-verify-report.json` and fails at the first broken command.

It does not add new features, dependency churn, provider expansion, export rewrites, scraping, image generation, copyrighted text extraction, paywall bypass, or source media rehosting.

## First-Run UX + Workflow Clarity

The current release is **v2.1.3 — First-Run UX + Workflow Clarity**.

This patch improves first-run workflow guidance:

```text
search → save → review → activation pack → export
```

Primary next action:

```text
Start with one broad search, save three useful references, then build an activation pack.
```

It keeps the v2.0.x release automation baseline and does not add dependency churn, provider expansion, export rewrites, scraping, image generation, copyrighted text extraction, paywall bypass, or source media rehosting.

Run:

```bash
npm run first-run:ux:check
npm run verify:release
```

## Controlled First-Run Panel Mount + UI Consistency

The current release is **v2.1.3 — Controlled First-Run Panel Mount + UI Consistency**.

This patch mounts the first-run workflow panel in `SearchPanel` using deterministic import and mount checks.

Run:

```bash
npm run first-run:panel:check
npm run verify:release
```

## First-Run Visual QA + Responsive Screenshot Evidence

The current release is **v2.1.3 — First-Run Visual QA + Responsive Screenshot Evidence**.

This patch adds visual QA evidence planning for the mounted first-run workflow panel.

Run:

```bash
npm run first-run:visual:evidence
npm run first-run:visual:check
npm run verify:release
```

Expected evidence manifest:

```text
artifacts/first-run-visual-evidence.json
```

## First-Run Evidence Artifact Review + Demo Capture Notes

The current release is **v2.1.3 — First-Run Evidence Artifact Review + Demo Capture Notes**.

This patch adds an evidence review artifact and demo capture notes for the first-run workflow.

Run:

```bash
npm run first-run:evidence-review
npm run first-run:evidence-review:check
npm run verify:release
```

Expected evidence artifact:

```text
artifacts/first-run-evidence-review.json
```
