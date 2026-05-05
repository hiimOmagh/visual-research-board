# v0.7.0 — Full QA Gate

## Baseline

Built on v0.6.1 — Stock/Illustrative Provider Pack.

## Changed files

- `package.json`
- `package-lock.json`
- `.github/workflows/ci.yml`
- `scripts/full-qa-gate.mjs`
- `tests/full-qa-gate-check.mjs`
- `README.md`
- `PATCH_MANIFEST.md`
- `docs/full-qa-gate.md`
- `docs/release-checklist.md`
- `docs/validation-report.md`
- version references in current app/test/docs files updated from `0.6.1` to `0.7.0`

## Summary

v0.7.0 adds a consolidated Full QA Gate. It does not add product scope. The release converts the long chained QA command into a categorized Node runner with deterministic execution, category filtering, list mode, and a JSON evidence artifact.

## Added commands

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

## Evidence artifact

```text
artifacts/full-qa-gate-report.json
```

## CI changes

The main CI workflow now runs:

```bash
npm run test:ci:no-browser
npm run build
```

It uploads `artifacts/full-qa-gate-report.json` as `full-qa-gate-report` using `actions/upload-artifact`.

## Guardrails

- v0.7.0 is validation hardening only.
- No provider expansion was added.
- No scraping behavior was added.
- Existing free-source/reference-search boundaries remain unchanged.
- Typecheck, lint, and build remain separate from deterministic fixture QA.

## Validation

Expected checks:

```bash
npm run full:qa:check
npm run qa
```

Full CI validation with installed dependencies:

```bash
npm run test:ci:no-browser
npm run build
```

## Retained prior feature gates

The v0.4.1 feature gates remain active in the Full QA Gate:

- Coverage and Bias Audit
- Evidence Pack Export v1
- Attribution Generator Upgrade

The v0.6.0/v0.6.1 provider-pack gates also remain active.

Retained v0.7.0 workflow/storage gates:

- UX Reliability + Empty State Polish
- Local Storage + Import/Export Hardening
