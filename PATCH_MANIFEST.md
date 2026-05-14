# v2.1.7 — Verification Report Freshness Lock + Warning Suppression Patch Manifest

## Scope

v2.1.7 adds a verification report freshness lock and stale warning suppression.

## Changed files

- `package.json`
- `package-lock.json`
- `scripts/release-verify.mjs`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/release-verify-runner-check.mjs`
- `tests/verification-report-freshness-lock-check.mjs`
- `docs/verification-report-freshness-lock.md`
- `docs/warning-suppression.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`
- selected `tests/*.mjs` stale-warning guards

## Verification behavior

- `npm run verify:all` remains the normal local command.
- `npm run verify:ci-parity` remains the clean install parity command.
- stale report warnings are suppressed only inside the active release verifier.
- real failing gates are not suppressed.

## Non-goals

- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — CI Parity Workflow Badge + Verification Docs Lock Patch Manifest

Adds `.github/workflows/ci-parity.yml`, README CI Parity badge, and verification docs lock.

Normal local: `npm run verify:all`. Clean install parity: `npm run verify:ci-parity`.

# v2.1.7 — Single-Command Verification UX + Release Command Compression Patch Manifest

## Scope

v2.1.7 formalizes the compressed verification command model.

## Changed files

- `package.json`
- `package-lock.json`
- `tests/single-command-verification-check.mjs`
- `tests/release-verify-runner-check.mjs`
- `tests/full-qa-gate-check.mjs`
- `scripts/full-qa-gate.mjs`
- `scripts/release-verify.mjs`
- `docs/single-command-verification.md`
- `docs/release-command-compression.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Command model

- `npm run verify:all` for normal local verification
- `npm run verify:ci-parity` for clean install parity
- individual commands only for debugging

## Non-goals

- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — First-Run Demo Script + Public Walkthrough Copy Patch Manifest

## Scope

v2.1.7 adds first-run demo narration and public walkthrough copy after the evidence artifact review milestone.

## Changed files

- `package.json`
- `package-lock.json`
- `scripts/first-run-demo-script.mjs`
- `scripts/full-qa-gate.mjs`
- `scripts/release-verify.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/first-run-demo-script-check.mjs`
- `docs/first-run-demo-script.md`
- `docs/public-walkthrough-copy.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — First-Run Evidence Artifact Review + Demo Capture Notes Patch Manifest

## Scope

v2.1.7 adds a first-run evidence artifact review layer and demo capture notes after the responsive screenshot evidence milestone.

## Changed files

- `package.json`
- `package-lock.json`
- `scripts/first-run-evidence-review.mjs`
- `scripts/full-qa-gate.mjs`
- `scripts/release-verify.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/first-run-evidence-review-check.mjs`
- `docs/first-run-evidence-artifact-review.md`
- `docs/first-run-demo-capture-notes.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — First-Run Visual QA + Responsive Screenshot Evidence Patch Manifest

## Scope

v2.1.7 adds first-run visual QA and responsive screenshot evidence planning after the controlled first-run panel mount.

## Changed files

- `package.json`
- `package-lock.json`
- `scripts/first-run-visual-evidence.mjs`
- `scripts/full-qa-gate.mjs`
- `scripts/release-verify.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/first-run-visual-qa-check.mjs`
- `docs/first-run-visual-qa-screenshot-evidence.md`
- `docs/first-run-responsive-screenshot-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — Controlled First-Run Panel Mount + UI Consistency Patch Manifest

## Scope

v2.1.7 safely mounts the first-run workflow panel in the SearchPanel UI.

## Changed files

- `package.json`
- `package-lock.json`
- `src/components/search/SearchPanel.tsx`
- `src/components/search/FirstRunWorkflowPanel.tsx`
- `scripts/full-qa-gate.mjs`
- `scripts/release-verify.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/first-run-panel-mount-check.mjs`
- `docs/controlled-first-run-panel-mount.md`
- `docs/ui-consistency-first-run-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — First-Run UX + Workflow Clarity Patch Manifest

## Scope

v2.1.7 improves first-run workflow clarity after the v2.0.x release automation baseline.

## Changed files

- `package.json`
- `package-lock.json`
- `src/lib/first-run-workflow.ts`
- `src/components/search/FirstRunWorkflowPanel.tsx`
- `src/components/search/SearchPanel.tsx` if the insertion point is detected
- `scripts/full-qa-gate.mjs`
- `scripts/release-verify.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/first-run-ux-workflow-check.mjs`
- `docs/first-run-ux-workflow-clarity.md`
- `docs/first-run-ux-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — Unified Release Verification Runner Patch Manifest

## Scope

v2.1.7 adds a unified release verification runner for local and CI parity.

## Changed files

- `package.json`
- `package-lock.json`
- `.github/workflows/ci.yml` or `.github/workflows/*.yaml` if present
- `scripts/release-verify.mjs`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/release-verify-runner-check.mjs`
- `docs/unified-release-verification-runner.md`
- `docs/release-verification-runner-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No new features
- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — Release Package Audit Patch Manifest

## Scope

v2.1.7 audits release package integrity after the public demo screenshot/evidence lock.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/release-package-audit-check.mjs`
- `docs/release-package-audit.md`
- `docs/release-package-audit-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No new features
- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — Public Demo Evidence + Screenshot Lock Patch Manifest

## Scope

v2.1.7 locks public demo screenshot/evidence requirements for the stable v2 workflow.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/public-demo-screenshot-lock-check.mjs`
- `docs/public-demo-evidence-screenshot-lock.md`
- `docs/public-demo-screenshot-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No new features
- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — Dependency Audit Triage Patch Manifest

## Scope

v2.1.7 triages the 2 moderate npm audit warnings without force-fixing or dependency churn.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/dependency-audit-triage-check.mjs`
- `docs/dependency-audit-triage.md`
- `docs/dependency-audit-triage-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No dependency churn
- No `npm audit fix --force`
- No feature changes
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — Stable Release Hygiene + Audit Warning Review Patch Manifest

## Scope

v2.1.7 is a hygiene-only patch after the v2.0.0 stable release.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/stable-release-hygiene-check.mjs`
- `docs/stable-release-hygiene-audit-review.md`
- `docs/audit-warning-review.md`
- `docs/release-artifact-hygiene.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No new features
- No dependency churn
- No `npm audit fix --force`
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.1.7 — Reference Workflow Stable Release Patch Manifest

## Scope

v2.1.7 stabilizes the full discovery → board → activation → export workflow.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/reference-workflow-stable-release-check.mjs`
- `docs/reference-workflow-stable-release.md`
- `docs/stable-reference-workflow-checklist.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Non-goals

- No new feature expansion
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No access circumvention
- No provider expansion
- No export rewrite
- No source media rehosting

# v2.1.7 — Activation Pack Export Integration Patch Manifest

## Scope

v2.1.7 connects activation pack Markdown/JSON preview output to existing text download utilities.

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

# v2.1.7 — Activation Pack Export Preview Patch Manifest

## Scope

v2.1.7 adds preview-only Markdown/JSON rendering for activation packs.

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

# v2.1.7 — Activation Pack UI Integration Patch Manifest

## Scope

v2.1.7 wires activation packs into a visible board workflow panel using already-gathered references.

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

# v2.1.7 — Reference Activation Pack MVP Patch Manifest

## Scope

v2.1.7 adds activation-ready reference packs built from already-gathered board/reference data.

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

# v2.1.7 — Book / Bibliographic Discovery Layer Patch Manifest

## Scope

v2.1.7 adds metadata-first book and bibliographic discovery planning and classification.

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

# v2.1.7 — Social Reference Discovery Layer Patch Manifest

## Scope

v2.1.7 adds public social-reference discovery planning and classification.

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

- No account-gated scraping
- No login bypass
- No hidden API abuse
- No media rehosting
- No dedicated social provider implementation yet
- No book search
- No generation engine
- No export behavior changes

# v2.1.7 — Broad Web + Image Discovery Expansion Patch Manifest

## Scope

v2.1.7 adds broad web/image discovery planning and candidate normalization.

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

# v2.1.7 — Broad Reference Result Model Patch Manifest

## Scope

v2.1.7 adds the Broad Reference Result Model.

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

# v2.1.7 — Reference Intelligence Layer MVP Patch Manifest

## Scope

v2.1.7 adds the Reference Intelligence Layer MVP.

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

# v2.1.7 — Public Demo Stable Release Patch Manifest

## Scope

v2.1.7 locks the public demo stable release.

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

# v2.1.7 — Public Demo Final Acceptance Patch Manifest

## Scope

v2.1.7 finalizes public-demo acceptance before stable release.

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

# v2.1.7 — Hosted Demo Evidence Review Patch Manifest

## Scope

v2.1.7 adds a hosted-demo evidence-review gate and documentation while preserving the v2.1.7 Public Demo Evidence Lock.

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

# v2.1.7 — Public Demo Evidence Lock Patch Manifest

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

v2.1.7 locks public-demo release evidence without changing product behavior.

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

# v2.1.7 — Public Demo Release Candidate Patch Manifest

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

v2.1.7 prepares the app as a Public Demo Release Candidate while preserving the v2.1.7 Security and Key Handling layer.

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

# v2.1.7 — Security and Key Handling Patch Manifest

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
- v2.1.7 — UX Reliability + Empty State Polish
- v2.1.7 — Local Storage + Import/Export Hardening
- v2.1.7 — Security and Key Handling

## v2.1.7 — Release Warning Cleanup

This micro-patch removes targeted lint warnings and updates CI action/runtime references while preserving v2.1.7 Public Demo Release Candidate and Security and Key Handling behavior.

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
