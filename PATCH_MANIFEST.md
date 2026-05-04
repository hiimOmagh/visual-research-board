# v0.3.1 — Project-Specific Review Evidence Memory

## Summary

Adds project-scoped review evidence memory so manual review calibration no longer behaves like global or transient saved-result metadata.

## Main changes

- Added `src/lib/project-review-memory.ts`.
- Added `ProjectReviewMemoryPanel`.
- Added project memory types:
  - `ProjectReviewEvidenceMemory`
  - `ProjectReviewEvidenceMemoryAudit`
  - `ProjectReviewEvidenceMemoryStatus`
- Added `review_evidence_memory` to `ResearchProject`.
- Added `project_review_evidence_memory` to search requests.
- Added `diagnostics.project_review_memory` to search responses.
- Search now sends project-specific memory with the active project isolation key.
- API and static client fallback use `project_review_evidence_memory.feedback` when review feedback is not supplied directly.
- Added memory reset behavior with `reset_at` and ignored pre-reset review diagnostics.
- Added stale-memory detection through saved-review fingerprinting.
- JSON/library/quality-review exports now preserve or report project review memory state.
- Updated release version to `0.3.1`.
- Added validation script: `npm run project:review:memory:check`.

## Validation

Passed:

```bash
npm run project:review:memory:check
npm run qa
```

Not completed successfully in this container:

```bash
npm run typecheck
npm run lint
```

Reason: `node_modules` is absent in this container, so TypeScript/ESLint fail on missing Next/React/Node/Tailwind/ESLint dependencies before source-level validation can complete.
