# v0.3.1 — Ranking Explainability + Calibration Audit

This release makes ranking inspectable instead of hidden.

## Objective

Every ranked candidate must carry a visible explanation of why it is placed where it is. The explanation separates base scoring, rights/reuse safety, provider/runtime context, metadata completeness, and review-evidence effects.

## Added fields

Each `ResearchResult` may include `ranking_explanation`:

- `schema_version: "0.3.0"`
- `final_rank`
- `baseline_overall`
- `final_overall`
- `score_delta_from_baseline`
- `calibration_confidence`
- `dominant_factors`
- `factors[]`
- `warnings[]`

Search diagnostics now include `ranking_explainability` with audit counts and warnings.

## Score factors

The ranking explanation reports these factors:

- topic relevance
- visual quality
- source credibility
- license clarity
- production usefulness
- rights/reuse signal
- source access mode
- metadata completeness
- provider runtime signal
- review-evidence delta

## Confidence labels

- `strong`: clear source/risk metadata and high ranking signal
- `moderate`: usable explanation with no severe warning
- `weak`: sparse review evidence, weak rights clarity, or metadata gaps
- `conflicting`: contradictory review evidence or negative review signal still near the top

## UI changes

- New `RankingExplainabilityPanel`
- Result cards show rank, confidence, review delta, and dominant factors
- Result detail drawer shows the full factor breakdown
- Exports include ranking explanation summaries

## Validation

Run:

```bash
npm run ranking:explain:check
npm run qa
```
