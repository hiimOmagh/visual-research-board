# v2.3.0 — Verification Artifact Schema Lock + Release Evidence Index Patch Manifest

## Scope

v2.3.0 adds a verification artifact schema lock and generated release evidence index.

## Changed files

- `package.json`
- `package-lock.json`
- `scripts/release-evidence-index.mjs`
- `scripts/release-verify.mjs`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/release-verify-runner-check.mjs`
- `tests/verification-artifact-schema-lock-check.mjs`
- `tests/release-evidence-index-check.mjs`
- `docs/verification-artifact-schema-lock.md`
- `docs/release-evidence-index.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`

## Verification behavior

- `npm run verify:all` remains the normal local command.
- `npm run verify:ci-parity` remains the clean install parity command.
- `npm run release:evidence:index` generates the artifact inventory.
- `npm run verification:artifact-schema:check` validates verification artifact structure.

## Non-goals

- No dependency churn
- No provider expansion
- No export rewrite
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No source media rehosting

# v2.3.0 — Verification Report Freshness Lock + Warning Suppression Patch Manifest

## Scope

v2.3.0 adds a verification report freshness lock and stale warning suppression.

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

# v2.3.0 — CI Parity Workflow Badge + Verification Docs Lock Patch Manifest

Adds `.github/workflows/ci-parity.yml`, README CI Parity badge, and verification docs lock.

Normal local: `npm run verify:all`. Clean install parity: `npm run verify:ci-parity`.

# v2.3.0 — Single-Command Verification UX + Release Command Compression Patch Manifest

## Scope

v2.3.0 formalizes the compressed verification command model.

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

# v2.3.0 — First-Run Demo Script + Public Walkthrough Copy Patch Manifest

## Scope

v2.3.0 adds first-run demo narration and public walkthrough copy after the evidence artifact review milestone.

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

# v2.3.0 — First-Run Evidence Artifact Review + Demo Capture Notes Patch Manifest

## Scope

v2.3.0 adds a first-run evidence artifact review layer and demo capture notes after the responsive screenshot evidence milestone.

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

# v2.3.0 — First-Run Visual QA + Responsive Screenshot Evidence Patch Manifest

## Scope

v2.3.0 adds first-run visual QA and responsive screenshot evidence planning after the controlled first-run panel mount.

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

# v2.3.0 — Controlled First-Run Panel Mount + UI Consistency Patch Manifest

## Scope

v2.3.0 safely mounts the first-run workflow panel in the SearchPanel UI.

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

# v2.3.0 — First-Run UX + Workflow Clarity Patch Manifest

## Scope

v2.3.0 improves first-run workflow clarity after the v2.0.x release automation baseline.

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

# v2.3.0 — Unified Release Verification Runner Patch Manifest

## Scope

v2.3.0 adds a unified release verification runner for local and CI parity.

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

# v2.3.0 — Release Package Audit Patch Manifest

## Scope

v2.3.0 audits release package integrity after the public demo screenshot/evidence lock.

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

# v2.3.0 — Public Demo Evidence + Screenshot Lock Patch Manifest

## Scope

v2.3.0 locks public demo screenshot/evidence requirements for the stable v2 workflow.

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

# v2.3.0 — Dependency Audit Triage Patch Manifest

## Scope

v2.3.0 triages the 2 moderate npm audit warnings without force-fixing or dependency churn.

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

# v2.3.0 — Stable Release Hygiene + Audit Warning Review Patch Manifest

## Scope

v2.3.0 is a hygiene-only patch after the v2.0.0 stable release.

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

# v2.3.0 — Reference Workflow Stable Release Patch Manifest

## Scope

v2.3.0 stabilizes the full discovery → board → activation → export workflow.

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

# v2.3.0 — Activation Pack Export Integration Patch Manifest

## Scope

v2.3.0 connects activation pack Markdown/JSON preview output to existing text download utilities.

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

# v2.3.0 — Activation Pack Export Preview Patch Manifest

## Scope

v2.3.0 adds preview-only Markdown/JSON rendering for activation packs.

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

# v2.3.0 — Activation Pack UI Integration Patch Manifest

## Scope

v2.3.0 wires activation packs into a visible board workflow panel using already-gathered references.

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

# v2.3.0 — Reference Activation Pack MVP Patch Manifest

## Scope

v2.3.0 adds activation-ready reference packs built from already-gathered board/reference data.

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

# v2.3.0 — Book / Bibliographic Discovery Layer Patch Manifest

## Scope

v2.3.0 adds metadata-first book and bibliographic discovery planning and classification.

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

# v2.3.0 — Social Reference Discovery Layer Patch Manifest

## Scope

v2.3.0 adds public social-reference discovery planning and classification.

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

# v2.3.0 — Broad Web + Image Discovery Expansion Patch Manifest

## Scope

v2.3.0 adds broad web/image discovery planning and candidate normalization.

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

# v2.3.0 — Broad Reference Result Model Patch Manifest

## Scope

v2.3.0 adds the Broad Reference Result Model.

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

# v2.3.0 — Reference Intelligence Layer MVP Patch Manifest

## Scope

v2.3.0 adds the Reference Intelligence Layer MVP.

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

# v2.3.0 — Public Demo Stable Release Patch Manifest

## Scope

v2.3.0 locks the public demo stable release.

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

# v2.3.0 — Public Demo Final Acceptance Patch Manifest

## Scope

v2.3.0 finalizes public-demo acceptance before stable release.

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

# v2.3.0 — Hosted Demo Evidence Review Patch Manifest

## Scope

v2.3.0 adds a hosted-demo evidence-review gate and documentation while preserving the v2.3.0 Public Demo Evidence Lock.

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

# v2.3.0 — Public Demo Evidence Lock Patch Manifest

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

v2.3.0 locks public-demo release evidence without changing product behavior.

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

# v2.3.0 — Public Demo Release Candidate Patch Manifest

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

v2.3.0 prepares the app as a Public Demo Release Candidate while preserving the v2.3.0 Security and Key Handling layer.

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

# v2.3.0 — Security and Key Handling Patch Manifest

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
- v2.3.0 — UX Reliability + Empty State Polish
- v2.3.0 — Local Storage + Import/Export Hardening
- v2.3.0 — Security and Key Handling

## v2.3.0 — Release Warning Cleanup

This micro-patch removes targeted lint warnings and updates CI action/runtime references while preserving v2.3.0 Public Demo Release Candidate and Security and Key Handling behavior.

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

## v2.3.0 Verification Commands

The release verification flow is intentionally compressed into stable commands:

- `npm run verify:artifacts` ? generates required verification artifacts, including first-run visual evidence, first-run evidence review, first-run demo script, and the release evidence index.
- `npm run verify:all` ? runs artifact generation and release verification.
- `npm run verify:ci-parity` ? performs a clean install with `npm ci`, then runs `verify:all`.

CI parity requirement: local release verification and CI verification must preserve the same command path. `verify:all` must not recursively call `verify:ci-parity`, and `verify:ci-parity` must not recursively call itself.

This preserves the CI Parity Workflow Badge + Verification Docs Lock and the Verification Artifact Schema Lock + Release Evidence Index.

## v2.3.0 — Nested Verification Warning Silence + Final Freshness Recheck

- Added nested stale-report warning suppression for release-verifier child checks.
- Added final freshness recheck after the release report is written as passed.
- Preserved compressed `verify:artifacts`, `verify:all`, and `verify:ci-parity` semantics.
- No dependency churn, provider expansion, scraping, or runtime feature expansion.
## v2.3.0 — Dependency Audit Resolution + Safe Upgrade Lock

- Adds dependency audit safe-upgrade lock artifact generation.
- Documents noncritical audit findings without using `npm audit fix --force`.
- Requires package-lock review and `npm run verify:ci-parity` after dependency changes.
- Blocks high/critical vulnerability release states.

## v2.3.0 — Dependency Audit Resolution + Safe Upgrade Lock

- Adds dependency audit safe-upgrade lock artifact generation.
- Adds `RUNBOOK-v2.3.0.md`.
- Documents nested verification warning silence and final freshness recheck.
- Documents noncritical audit findings without using `npm audit fix --force`.
- Requires package-lock review and `npm run verify:ci-parity` after dependency changes.
- Blocks high/critical vulnerability release states.

## v2.3.0 — End-to-End Creator Research Workflow MVP

- Added local-first creator research workflow data model.
- Added Research Brief panel, Smart Query Plan Preview, demo discovery results, review actions, saved board sections, and Evidence Pack Export Preview v2.
- Added Carthage documentary-thumbnail demo scenario.
- Added `npm run creator-workflow:mvp:check`.
- Avoided packaging expansion, OAuth, paid API requirements, and fake live-provider claims.

## v2.3.0 — Creator Workflow Interaction Polish + Real Use-Path Validation

Changed:
- `src/components/search/CreatorWorkflowPanel.tsx`
- `app/creator-workflow/page.tsx`
- `scripts/creator-workflow-manual-review.mjs`
- `tests/creator-workflow-interaction-polish-check.mjs`
- `RUNBOOK-v2.3.0.md`

Validation:
- `npm run creator-workflow:interaction:check`
- `npm run qa`
- `npm run verify:ci-parity`



## v2.3.0 — Creator Workflow Usability Depth Pass

- Added creator workflow usability depth contract.
- Replaced the creator workflow panel with a fuller local-first use path.
- Added saved-reference editing and section movement.
- Added export-preview coverage and next-step guidance.
- Added `creator-workflow:usability:check` and `creator-workflow:usability:review`.


## v2.3.0 — Real Creator Session Quality Pass

- Added `src/lib/creator-session-quality.ts`.
- Rebuilt `src/components/search/CreatorWorkflowPanel.tsx` around a real creator research session.
- Ensured `/creator-workflow` renders the product workflow.
- Added `scripts/creator-session-quality-review.mjs`.
- Added `tests/creator-session-quality-pass-check.mjs`.
- Registered `creator-session-quality-pass` in the full QA gate.
- Updated package metadata and documentation to v2.3.0.
