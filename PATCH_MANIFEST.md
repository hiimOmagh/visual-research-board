# v0.8.1 — Public Demo Release Candidate Patch Manifest

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

v0.8.1 prepares the app as a Public Demo Release Candidate while preserving the v0.8.1 Security and Key Handling layer.

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

# v0.8.1 — Security and Key Handling Patch Manifest

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
- v0.8.1 — UX Reliability + Empty State Polish
- v0.8.1 — Local Storage + Import/Export Hardening
- v0.8.1 — Security and Key Handling

## v0.8.1 — Release Warning Cleanup

This micro-patch removes targeted lint warnings and updates CI action/runtime references while preserving v0.8.1 Public Demo Release Candidate and Security and Key Handling behavior.

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
