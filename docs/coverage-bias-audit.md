# v0.3.4 — Coverage and Bias Audit

This release adds a project-level coverage gate for the Visual Research Board. The audit checks whether saved sources and linked claims are defensible before export.

## What the audit detects

- Provider overreliance.
- Domain concentration.
- Source-group concentration.
- Reference-only overload.
- Check-required and unknown-rights accumulation.
- High reuse-risk / avoid-grade material.
- Claims without supporting evidence.
- Claims without weakening or contradictory evidence.
- Saved sources that are not mapped to any claim.
- Visual-reference links being used as a substitute for factual support.

## UI surface

`CoverageBiasAuditPanel` appears in the main workspace below claim mapping. It summarizes:

- saved item count
- provider/domain/source-group diversity
- dominant provider/domain/source group
- reusable candidate counts
- rights-risk counts
- claim support/counter-evidence gaps
- warnings

## Export behavior

Coverage data is included in:

- JSON export under `audit.coverage_bias`
- Markdown and production brief summaries
- CSV `coverage_flags`
- project-library audit counters
- new `coverage_audit` export template

## Validation

Run:

```bash
npm run coverage:bias:check
npm run qa
```

The check verifies the audit type, library, UI panel, search diagnostics, export integration, and version metadata.
