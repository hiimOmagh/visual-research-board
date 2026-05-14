# Stable Reference Workflow Checklist — v2.1.5

## public demo UX final pass

- Verify first-screen clarity.
- Verify empty states.
- Verify board workflow labels.
- Verify activation pack workflow visibility.
- Verify export integration copy.
- Verify no unavailable/fake-live features are shown.

## release docs

- README references v2.1.5.
- PATCH_MANIFEST references v2.1.5.
- validation report references v2.1.5.
- release checklist references v2.1.5.
- reference workflow stable release doc exists.

## screenshots

Capture hosted/public demo screenshots for:

- landing/default state
- discovery/board state
- activation pack workflow
- export integration panel
- empty-state behavior
- mobile-width sanity
- desktop-width sanity

## full QA artifact

Required artifact:

- artifacts/full-qa-gate-report.json
- app_version = 2.1.5
- status = passed
- failed_gate_count = 0

## npm ci

Run:

```bash
rm -rf node_modules
npm ci
```

Do not run `npm audit fix --force` in this stable release.

## final validation

```bash
npm run reference-workflow:stable:check
npm run activation-pack:export:check
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
npm run reference-workflow:stable:check
```

## tag v2.1.5

After CI is green:

```bash
git tag -a v2.1.5 -m "v2.1.5 — Reference Workflow Stable Release"
git push origin v2.1.5
```
