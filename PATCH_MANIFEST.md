# v0.2.8 Patch Manifest — Review-Evidence Feedback into Ranking Calibration

Apply this package over `visual-research-board-v0.2.7`. It contains only files changed or added for v0.2.8.

## Added files

- `docs/review-evidence-feedback-calibration.md`
- `src/components/search/ReviewEvidenceFeedbackPanel.tsx`
- `src/lib/review-evidence-feedback.ts`
- `tests/review-evidence-feedback-check.mjs`

## Modified files

- `.env.example`
- `README.md`
- `docs/broad-image-retrieval.md`
- `docs/browser-qa-checklist.md`
- `docs/deployed-browser-evidence.md`
- `docs/deployment.md`
- `docs/evidence-driven-ranking-query-tuning.md`
- `docs/live-retrieval-quality-calibration.md`
- `docs/manual-quality-review-loop.md`
- `docs/provider-result-inspector.md`
- `docs/provider-runtime-test-pack.md`
- `docs/provider-setup.md`
- `docs/real-retrieval-validation.md`
- `docs/real-topic-test-matrix.md`
- `docs/release-checklist.md`
- `docs/retrieval-weak-case-auto-tuning.md`
- `docs/validation-report.md`
- `package-lock.json`
- `package.json`
- `scripts/deployed-browser-evidence.mjs`
- `scripts/evidence-driven-tuning-report.mjs`
- `scripts/real-topic-test-matrix.mjs`
- `src/app/api/search/route.ts`
- `src/components/search/SearchPanel.tsx`
- `src/lib/client-search.ts`
- `src/lib/export.ts`
- `src/lib/provider-runtime.ts`
- `src/types/research.ts`
- `tests/broad-retrieval-check.mjs`
- `tests/deployed-browser-evidence-check.mjs`
- `tests/evidence-driven-tuning-check.mjs`
- `tests/manual-quality-review-check.mjs`
- `tests/provider-result-inspector-check.mjs`
- `tests/provider-runtime-pack-check.mjs`
- `tests/qa-check.mjs`
- `tests/real-topic-matrix-check.mjs`
- `tests/retrieval-autotuning-check.mjs`
- `tests/retrieval-calibration-check.mjs`
- `tests/retrieval-evidence-check.mjs`

## Deleted files

- none

## Validation performed

- `npm run review:evidence:check` — passed
- `npm run qa` — passed
- `npm run typecheck` — not completed in this container because dependency installation for Next.js timed out / remained incomplete.
- `npm run lint` — not completed for the same dependency-installation reason.
