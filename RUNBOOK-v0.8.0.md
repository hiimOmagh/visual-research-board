# v0.8.0 Public Demo Release Candidate — Runbook

## Preconditions

Apply `visual-research-board-v0.8.0-security-key-handling-patch.zip` first if the repo is not already on v0.8.0.

The v0.8.0 patch expects the v0.8.0 Full QA Gate and Security/Key Handling baseline:

- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `tests/security-key-handling-check.mjs`
- `npm run security:key:check`
- `npm run qa:security`

## Apply

Copy the contents of this patch folder into the repository root, then run:

```bash
node apply-v0.8.0-public-demo-rc.mjs
```

## Validate

```bash
npm run clean:rc
npm install
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## Commit

```bash
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs scripts/clean-release-candidate.mjs tests/full-qa-gate-check.mjs tests/public-demo-release-candidate-check.mjs docs/public-demo.md docs/release-candidate-checklist.md docs/full-qa-gate.md docs/release-checklist.md docs/validation-report.md src/lib/public-demo-release-candidate.ts src/components/PublicDemoReleaseCandidatePanel.tsx
git commit -m "chore: prepare v0.8.0 public demo release candidate"
```
