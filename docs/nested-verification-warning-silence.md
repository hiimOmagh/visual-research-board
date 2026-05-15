# Nested Verification Warning Silence + Final Freshness Recheck — v2.2.0

v2.2.0 keeps the single-command verification path intact while removing misleading stale-report warnings from nested release verification runs.

## Problem corrected

`npm run verify:all` intentionally runs `verify:artifacts` and then `verify:release`. Inside `verify:release`, the runner executes checks that may inspect `artifacts/full-qa-gate-report.json` and `artifacts/release-verify-report.json` before the current release report is finalized. Earlier versions allowed those nested checks to print stale-report warnings even when the final verification path later passed.

## Correction

- Nested release verification sets `VRB_SUPPRESS_STALE_REPORT_WARNINGS=1` for inner checks.
- Stale-report warning checks honor the suppression flag.
- The release verifier writes a passed report before the final freshness recheck.
- The final freshness recheck runs with suppression cleared, so the final report is tested without hiding a real freshness error.
- The final release report records the `final_freshness_recheck` phase.

## Operator commands

Use the same compressed commands:

```powershell
npm run verify:all
```

For CI parity from a clean install:

```powershell
npm run verify:ci-parity
```

## Guardrails

This patch does not add providers, scraping, source-media rehosting, image generation, export rewrites, dependency churn, or new runtime features. It only tightens verification reporting semantics.
