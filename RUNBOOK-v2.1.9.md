# RUNBOOK — v2.1.9 Nested Verification Warning Silence + Final Freshness Recheck

## Scope

v2.1.9 is a verification UX and release evidence patch. It preserves the existing one-command release path while preventing nested stale-report warnings from appearing during a valid release verification run.

## Changed commands

No operator command changes.

```powershell
npm run verify:all
```

Clean parity path:

```powershell
npm run verify:ci-parity
```

## Acceptance

The release is acceptable when these pass:

```powershell
npm run nested:verification:warnings:check
npm run verify:all
npm run qa
npm run verify:all
```

Expected result: the final `verify:all` ends with `[release-verify] passed for v2.1.9`, and the release report includes the final freshness recheck phase.

## Non-goals

No dependency upgrades, provider expansion, scraping, private-account access, source media rehosting, export rewrite, image generation, paywall bypass, or copyrighted text extraction.
