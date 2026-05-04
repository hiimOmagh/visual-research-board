# v0.3.0 — Ranking Explainability + Calibration Audit Patch Manifest

## Release objective

Make ranking inspectable after review-evidence calibration. v0.3.0 adds per-result factor explanations, review-delta visibility, confidence labels, and an aggregate calibration audit so ranking is no longer a hidden score.

## Core changes

- Added `src/lib/ranking-explainability.ts`.
- Added `RankingExplanation`, `RankingExplanationFactor`, and `RankingExplainabilityAudit` types.
- Added `ranking_explanation` on each ranked result.
- Added `diagnostics.ranking_explainability`.
- Added `RankingExplainabilityPanel`.
- Result cards now show rank, confidence, review delta, and dominant factors.
- Result detail panel now shows full factor breakdown and ranking warnings.
- Exports now include ranking explanation summaries and confidence counts.
- Search runtime and static client fallback both build ranking explanations from the same library.
- Added docs: `docs/ranking-explainability-calibration-audit.md`.
- Added validation: `npm run ranking:explain:check`.
- Updated release metadata to `0.3.0`.

## Validation run

Passed:

```bash
npm run ranking:explain:check
npm run qa
```

Also verified the late QA gates individually:

```bash
node tests/manual-quality-review-check.mjs
node tests/review-evidence-feedback-check.mjs
node tests/free-image-retrieval-check.mjs
node tests/normalization-dedupe-check.mjs
node tests/query-routing-check.mjs
node tests/ranking-explainability-check.mjs
```

Not completed:

```bash
npm run typecheck
npm run lint
```

Reason: this container has no installed `node_modules`; TypeScript/ESLint fail on missing Next/React/Node/Tailwind/ESLint dependencies. The dedicated source/fixture gates passed.

## Changed-file patch

This ZIP contains files modified or added relative to v0.2.11.
