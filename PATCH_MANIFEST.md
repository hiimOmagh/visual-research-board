# v1.9.0 — Activation Pack Export Integration Patch Manifest

## Scope

v1.9.0 connects activation pack Markdown/JSON preview output to existing text download utilities.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/activation-pack-export-integration-check.mjs`
- `src/types/activation-pack-export-integration.ts`
- `src/lib/activation-pack-export-integration.ts`
- `src/components/search/ActivationPackExportIntegrationPanel.tsx`
- `src/components/search/ActivationPackWorkflowPanel.tsx`
- `docs/activation-pack-export-integration.md`
- `docs/activation-pack-export-integration-boundaries.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No export system rewrite
- No broad export expansion
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No access circumvention
- No source media rehosting

# v1.9.0 — Activation Pack Export Preview Patch Manifest

## Scope

v1.9.0 adds preview-only Markdown/JSON rendering for activation packs.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/activation-pack-export-preview-check.mjs`
- `src/types/activation-pack-export-preview.ts`
- `src/lib/activation-pack-export-preview.ts`
- `src/components/search/ActivationPackExportPreviewPanel.tsx`
- `docs/activation-pack-export-preview.md`
- `docs/activation-pack-export-preview-boundaries.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No broad export system rewrite
- No file download expansion
- No new download behavior
- No image generation
- No scraping
- No copyrighted text extraction
- No paywall bypass
- No access circumvention

# v1.9.0 — Activation Pack UI Integration Patch Manifest

## Scope

v1.9.0 wires activation packs into a visible board workflow panel using already-gathered references.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/activation-pack-ui-integration-check.mjs`
- `src/types/activation-pack-ui.ts`
- `src/lib/activation-pack-ui.ts`
- `src/components/search/ActivationPackWorkflowPanel.tsx`
- `docs/activation-pack-ui-integration.md`
- `docs/activation-pack-ui-workflow.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No image generation
- No scraping
- No copyrighted text extraction
- No paywall bypass
- No access circumvention
- No export behavior changes

# v1.9.0 — Reference Activation Pack MVP Patch Manifest

## Scope

v1.9.0 adds activation-ready reference packs built from already-gathered board/reference data.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/reference-activation-pack-check.mjs`
- `src/types/reference-activation-pack.ts`
- `src/lib/reference-activation-pack.ts`
- `src/components/search/ReferenceActivationPackPanel.tsx`
- `docs/reference-activation-pack.md`
- `docs/reference-activation-safety-boundaries.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No image generation
- No scraping
- No copyrighted text extraction
- No paywall bypass
- No access circumvention
- No broad export behavior changes

# v1.9.0 — Book / Bibliographic Discovery Layer Patch Manifest

## Scope

v1.9.0 adds metadata-first book and bibliographic discovery planning and classification.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/book-bibliographic-discovery-check.mjs`
- `src/types/book-reference.ts`
- `src/lib/book-bibliographic-discovery.ts`
- `src/components/search/BookBibliographicDiscoveryPanel.tsx`
- `docs/book-bibliographic-discovery.md`
- `docs/book-reference-safety-boundaries.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No copyrighted text extraction
- No full-text scraping
- No paywall bypass
- No access circumvention
- No generation engine
- No export behavior changes

# v1.9.0 — Social Reference Discovery Layer Patch Manifest

## Scope

v1.9.0 adds public social-reference discovery planning and classification.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/social-reference-discovery-check.mjs`
- `src/types/social-reference.ts`
- `src/lib/social-reference-discovery.ts`
- `src/components/search/SocialReferenceDiscoveryPanel.tsx`
- `docs/social-reference-discovery.md`
- `docs/social-reference-safety-boundaries.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No private account scraping
- No login bypass
- No hidden API abuse
- No media rehosting
- No dedicated social provider implementation yet
- No book search
- No generation engine
- No export behavior changes

# v1.9.0 — Broad Web + Image Discovery Expansion Patch Manifest

## Scope

v1.9.0 adds broad web/image discovery planning and candidate normalization.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/broad-web-image-discovery-check.mjs`
- `src/types/broad-discovery.ts`
- `src/lib/broad-discovery.ts`
- `src/components/search/BroadDiscoveryModePanel.tsx`
- `docs/broad-web-image-discovery.md`
- `docs/discovery-mode-taxonomy.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No provider changes
- No retrieval logic changes
- No scraping
- No dedicated social search
- No dedicated book search
- No generation engine
- No export behavior changes

# v1.9.0 — Broad Reference Result Model Patch Manifest

## Scope

v1.9.0 adds the Broad Reference Result Model.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/broad-reference-result-model-check.mjs`
- `src/types/broad-reference-result.ts`
- `src/lib/broad-reference-result.ts`
- `src/components/search/SourceClassBadge.tsx`
- `src/components/search/BroadReferenceResultPanel.tsx`
- `docs/broad-reference-result-model.md`
- `docs/source-class-taxonomy.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No provider changes
- No retrieval logic changes
- No social search implementation yet
- No book search implementation yet
- No generation engine
- No export behavior changes yet

# v1.9.0 — Reference Intelligence Layer MVP Patch Manifest

## Scope

v1.9.0 adds the Reference Intelligence Layer MVP.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/reference-intelligence-check.mjs`
- `src/types/reference-intelligence.ts`
- `src/lib/reference-intelligence.ts`
- `src/components/search/ReferenceIntelligencePanel.tsx`
- `docs/reference-intelligence-layer.md`
- `docs/reference-intelligence-workflow.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No provider changes
- No retrieval logic changes
- No social search
- No book search
- No generation engine
- No export behavior changes yet

# v1.9.0 — Public Demo Stable Release Patch Manifest

## Scope

v1.9.0 locks the public demo stable release.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/public-demo-stable-release-check.mjs`
- `docs/public-demo-stable-release.md`
- `docs/stable-release-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No feature changes
- No provider changes
- No retrieval logic changes
- No export behavior changes
- No social/book/generation expansion

# v1.9.0 — Public Demo Final Acceptance Patch Manifest

## Scope

v1.9.0 finalizes public-demo acceptance before stable release.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/public-demo-final-acceptance-check.mjs`
- `docs/public-demo-final-acceptance.md`
- `docs/final-demo-review-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No feature changes
- No provider changes
- No retrieval logic changes
- No export behavior changes

# v1.9.0 — Hosted Demo Evidence Review Patch Manifest

## Scope

v1.9.0 adds a hosted-demo evidence-review gate and documentation while preserving the v1.9.0 Public Demo Evidence Lock.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/hosted-demo-evidence-review-check.mjs`
- `docs/hosted-demo-evidence-review.md`
- `docs/hosted-demo-review-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No feature changes
- No provider changes
- No retrieval logic changes
- No export behavior changes

# v1.9.0 — Public Demo Evidence Lock Patch Manifest

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/public-demo-evidence-lock-check.mjs`
- `docs/public-demo-evidence-lock.md`
- `docs/release-evidence-lock.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Scope

v1.9.0 locks public-demo release evidence without changing product behavior.

## Non-goals

- No provider changes
- No retrieval changes
- No export changes
- No security/key-handling changes
- No new scraping behavior

## Validation

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

# v1.9.0 — Public Demo Release Candidate Patch Manifest

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `scripts/clean-release-candidate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/public-demo-release-candidate-check.mjs`
- `docs/public-demo.md`
- `docs/release-candidate-checklist.md`
- `docs/full-qa-gate.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`
- `src/lib/public-demo-release-candidate.ts`
- `src/components/PublicDemoReleaseCandidatePanel.tsx`

## Scope

v1.9.0 prepares the app as a Public Demo Release Candidate while preserving the v1.9.0 Security and Key Handling layer.

## Non-goals

- No new scraping behavior
- No production OAuth
- No paid-provider assumptions
- No fake-live providers
- No legal-clearance claims
- No source-verification guarantees

## Validation

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

# v1.9.0 — Security and Key Handling Patch Manifest

## Changed files

- `package.json`
- `package-lock.json`
- `.env.example`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/security-key-handling-check.mjs`
- `docs/full-qa-gate.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`
- `docs/security-and-key-handling.md`
- `src/types/research.ts`
- `src/lib/provider-key-security.ts`
- `src/lib/provider-runtime.ts`
- `src/lib/providers/brave.ts`
- `src/lib/providers/tavily.ts`
- `src/lib/providers/smithsonian.ts`
- `src/lib/providers/europeana.ts`
- `src/lib/providers/museum-open-access.ts`
- `src/lib/providers/stock-illustrative.ts`
- `src/app/api/search/route.ts`
- `src/app/api/provider-runtime/route.ts`
- `src/components/search/ProviderRuntimePanel.tsx`

## Capability

Security and Key Handling centralizes provider secret env access, exposes redacted key readiness diagnostics, detects `NEXT_PUBLIC_*` secret-like env names, and adds `npm run security:key:check` plus a `security` category in the Full QA Gate.

## Retained cumulative QA anchors

These labels are intentionally retained because the consolidated QA gate validates historical capabilities as active release surfaces:

- v0.4.1 — Evidence Pack Export v1
- v0.4.1 — Attribution Generator Upgrade
- v0.4.1 — Coverage and Bias Audit
- v1.9.0 — UX Reliability + Empty State Polish
- v1.9.0 — Local Storage + Import/Export Hardening
- v1.9.0 — Security and Key Handling

## v1.9.0 — Release Warning Cleanup

This micro-patch removes targeted lint warnings and updates CI action/runtime references while preserving v1.9.0 Public Demo Release Candidate and Security and Key Handling behavior.

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
