# Visual Research Board

`v0.4.0 evidence pack export package`

A free-source visual research board for discovering, saving, reviewing, ranking, organizing, claim-linking, auditing, and exporting image/source evidence.

## v0.4.0 focus

v0.4.0 adds **Evidence Pack Export v1**. Saved board items can now be exported as a consolidated evidence pack with clear production buckets:

- reusable / likely safe candidates
- check required before use
- reference-only discovery leads
- restricted, rejected, or avoid

The evidence pack preserves source URLs, provider/source group, board section, rights status, reuse risk, license label, manual review state, linked claims, notes, tags, attribution draft lines, and warnings.

## Validation

```bash
npm run evidence:pack:check
npm run qa
```

## Guardrail

Evidence-pack labels are workflow categories, not legal clearance. Verify every source page, image file, creator, and license before publication or commercial use.

## Compatibility validation commands

Earlier gates remain available and are still included in `npm run qa`:

```bash
npm run deployed:browser:test
npm run topic:matrix:test
```

This package continues the evidence validation path introduced in v0.3.1 while advancing the export layer to v0.4.0.
