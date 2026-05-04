# v0.3.1 — Project-Specific Review Evidence Memory

This release isolates review-evidence calibration per project.

## Purpose

Manual review labels should not behave like global preference memory. A rejected source in one project may be irrelevant to another project. v0.3.1 stores a project-scoped review evidence memory object and sends it with each search request.

## Memory behavior

Each project can carry `review_evidence_memory`:

- `project_id`
- `isolation_key` using `project:<project_id>`
- `reset_at` marker
- included review result IDs
- ignored pre-reset review count
- generated `ReviewEvidenceFeedback`
- confidence and status
- warnings

The app refreshes memory from the active project before search. The API and static client fallback then use `project_review_evidence_memory.feedback` for ranking calibration.

## Reset behavior

The reset button records a reset marker. Reviews dated before the reset are ignored until refreshed by a later review update. This gives users a clean calibration boundary without deleting saved references.

## Diagnostics

Search responses include `diagnostics.project_review_memory` with:

- status
- stale/current state
- isolation key
- confidence
- included review count
- ignored pre-reset count
- domain/source-group/provider bias counts
- warnings

## Export behavior

Library exports preserve project memory. JSON and Quality Review exports include project-memory audit context.

## Validation

Run:

```bash
npm run project:review:memory:check
npm run qa
```
