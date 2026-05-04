# Evidence-Driven Ranking / Query Tuning — v0.3.0

`v0.3.0` turns the runtime evidence layer into an explicit ranking and query-tuning layer.

The previous versions could measure weak retrieval cases. This version uses those weak signals to tune:

- query hints
- source targets
- ranking weights
- provider bias
- top-result source diversity
- license/source/risk penalties

## Core principle

The product should not keep adding speculative features. It should use evidence from real topic tests to improve retrieval behavior.

The tuning layer consumes:

- `diagnostics.retrieval_evidence`
- `diagnostics.quality_calibration`
- `diagnostics.auto_tuning`
- `diagnostics.evidence_tuning`
- `artifacts/real-topic-test-matrix.json` when available

## Runtime behavior

The `/api/search` route now builds an evidence-driven tuning plan after the baseline retrieval evidence and creator-gate calibration are calculated.

When weak metrics are detected, it can:

- add precision query hints
- boost topic exactness
- boost image density
- bias open-license sources
- bias institutional/archive sources
- penalize stock/social/unknown source groups
- penalize mock results when real providers are active
- rebalance top results by source group

The diagnostic trace is attached as:

```json
{
  "diagnostics": {
    "evidence_tuning": {
      "applied": true,
      "actions": ["boost_topic_exactness", "rebalance_top_results_by_source"],
      "query_hints": [],
      "score_weight_profile": {},
      "provider_bias": {},
      "weak_metrics": []
    }
  }
}
```

## Disable switch

Use this when you want to compare baseline/autotuned behavior against evidence-driven ranking:

```bash
VISUAL_RESEARCH_BOARD_DISABLE_EVIDENCE_TUNING=true npm run dev
```

## Evidence report command

After running the real-topic matrix against localhost or deployment:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run topic:matrix:test
npm run evidence:tuning:test
```

This writes:

```text
artifacts/evidence-driven-tuning-report.json
```

If no runtime matrix artifact exists, the script falls back to `tests/fixtures/real-topic-test-matrix.json` and marks the report as `needs_runtime_topic_matrix_artifact`.

## Strict mode

```bash
VISUAL_RESEARCH_BOARD_REQUIRE_EVIDENCE_TUNING_PASS=true npm run evidence:tuning:test
```

Strict mode fails when only fixture data exists and no runtime topic-matrix artifact has been produced.

## Acceptance target

A good v0.3.0 run should show:

- evidence tuning trace present in search diagnostics
- weak metrics clearly listed
- query hints visible when weak cases occur
- source/risk/license-aware ranking reasons on tuned results
- topic matrix artifacts consumed by the evidence report script
- no claim of literal all-web crawling

## Boundary

This is evidence-driven retrieval improvement, not a web-scale crawler. The tool still depends on the configured providers and their returned results.
