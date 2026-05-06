# Validation Report — Visual Research Board v1.8.0

## Package

```text
visual-research-board-v1.8.0-full-qa-gate-patch.zip
```

## Release focus

**Full QA Gate**. This release consolidates deterministic validation into a categorized runner and generates machine-readable release evidence.

## Expected command

```bash
npm run qa
```

## Evidence artifact

```text
artifacts/full-qa-gate-report.json
```

## Included gate categories

```text
baseline
retrieval
providers
workflow
exports
release
```

## Additional local validation before deployment

```bash
npm run typecheck
npm run lint
npm run build
npm run build:static
```

## Runtime evidence commands retained

Provider readiness/runtime smoke:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run provider:runtime:test
```

Live retrieval quality calibration:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run retrieval:quality:test
```

## Status standard

A v1.8.0 validation pass requires:

```text
npm run qa: passed
artifacts/full-qa-gate-report.json: generated
failed_gate_count: 0
```

v1.8.0 does not expand scraping, provider access, or search-engine automation. It hardens the project’s ability to prove that the current research workflow remains intact.

## v1.8.0 Security and Key Handling

Security and Key Handling adds provider-key diagnostics to the Full QA Gate. It validates server-only env usage, redacted key presence, and public-env leakage detection while preserving the existing `artifacts/full-qa-gate-report.json` evidence artifact.

## v1.8.0 Public Demo Release Candidate

v1.8.0 hardens the project for public-demo inspection. It adds a public-demo release-candidate check, a cleanup command, demo-safe documentation, and explicit non-goals around scraping, production OAuth, legal clearance, and source-verification guarantees.

Required validation:

```bash
npm run clean:rc
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## v1.8.0 — Release Warning Cleanup

This micro-patch removes targeted lint warnings and updates CI action/runtime references while preserving v1.8.0 Public Demo Release Candidate and Security and Key Handling behavior.

Validation:

```bash
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## v1.8.0 Public Demo Evidence Lock

v1.8.0 adds a public-demo evidence lock gate. It verifies release evidence docs, preserved public-demo/security/warning checks, and Full QA Gate inclusion.

Required validation:

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

## v1.8.0 Hosted Demo Evidence Review

v1.8.0 adds the hosted-demo evidence-review gate. The release does not change application behavior.

Required validation:

```bash
npm run hosted-demo:evidence:check
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

## v1.8.0 Public Demo Final Acceptance

v1.8.0 adds the final public-demo acceptance gate. The release does not change application behavior.

Required validation:

```bash
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run public-demo:final:check
```

## v1.8.0 Public Demo Stable Release

v1.8.0 adds the stable public-demo release gate. The release does not change application behavior.

Required validation:

```bash
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run public-demo:stable:check
```

## v1.8.0 Reference Intelligence Layer MVP

v1.8.0 adds the Reference Intelligence Layer MVP. The release classifies results as usable references without changing provider or retrieval behavior.

Required validation:

```bash
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run reference:intelligence:check
```

## v1.8.0 Broad Reference Result Model

v1.8.0 adds the Broad Reference Result Model. It makes source classes first-class without changing provider or retrieval behavior.

Required validation:

```bash
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run broad-reference:model:check
```

## v1.8.0 Broad Web + Image Discovery Expansion

v1.8.0 adds broad web/image discovery mode planning and candidate normalization. It does not change provider or retrieval behavior.

Required validation:

```bash
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run broad-discovery:check
```

## v1.8.0 Social Reference Discovery Layer

v1.8.0 adds public social-reference discovery planning and classification. It does not add private scraping, login bypass, dedicated social provider implementation, generation behavior, or export behavior changes.

Required validation:

```bash
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run social-reference:check
```

## v1.8.0 Book / Bibliographic Discovery Layer

v1.8.0 adds metadata-first book and bibliographic discovery planning and classification. It does not add copyrighted text extraction, full-text scraping, paywall bypass, generation behavior, or export behavior changes.

Required validation:

```bash
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run book-reference:check
```

## v1.8.0 Reference Activation Pack MVP

v1.8.0 adds activation-ready reference packs from gathered board/reference data. It does not add image generation, scraping, copyrighted text extraction, paywall bypass, or broad export behavior changes.

Required validation:

```bash
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run reference-activation:check
```

## v1.8.0 Activation Pack UI Integration

v1.8.0 integrates activation packs into the board workflow UI using already-gathered references. It does not add image generation, scraping, copyrighted text extraction, paywall bypass, or export behavior changes.

Required validation:

```bash
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run activation-pack:ui:check
```

## v1.8.0 Activation Pack Export Preview

v1.8.0 previews activation packs as structured Markdown/JSON text. It does not add broad export rewrites, file download expansion, image generation, scraping, copyrighted text extraction, paywall bypass, or access circumvention.

Required validation:

```bash
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run activation-pack:export-preview:check
```
