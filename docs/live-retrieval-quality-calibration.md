# Live Retrieval Quality Calibration — v0.2.7

`v0.2.7` adds a creator-facing quality calibration layer on top of broad retrieval evidence.

The previous gate answered: **did the search retrieve enough candidates?**

This version adds a stricter question: **are the retrieved candidates useful enough for creator curation?**

## What the calibration measures

The `quality_calibration` object is attached to every `/api/search` response inside `diagnostics`.

It measures:

- relevant candidates
- high-visual candidates
- strong-source candidates
- clear-license candidates
- low-risk candidates
- strong creator candidates
- top-10 average overall score
- top-10 average relevance
- top-10 average visual quality
- top-10 source diversity
- real-provider result count
- mock result count
- real-provider share
- image share
- calibration score
- top calibrated candidate IDs

## Verdicts

Possible `quality_calibration.verdict` values:

- `passes_creator_gate`
- `needs_more_relevance`
- `needs_more_visuals`
- `needs_stronger_sources`
- `needs_license_clarity`
- `needs_real_provider_evidence`
- `needs_manual_review`

## Runtime test command

Start the app locally or deploy it to a Next.js runtime, then run:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run retrieval:quality:test
```

For a deployed runtime:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-vercel-app.vercel.app npm run retrieval:quality:test
```

The script writes:

```text
artifacts/retrieval-quality-calibration.json
```

## Strict creator gate

To fail the script when any calibration case does not pass the creator gate:

```bash
VISUAL_RESEARCH_BOARD_REQUIRE_CREATOR_GATE=true \
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-vercel-app.vercel.app \
npm run retrieval:quality:test
```

Use the strict gate only after real provider keys are configured. Mock-only demos are expected to fail the real-provider share criterion.

## Interpretation

A broad retrieval pass is not enough. A creator-ready search should produce a candidate set where:

- enough items are relevant to the topic and mode
- enough items are image-heavy for visual work
- source diversity is visible in the top candidates
- source and license uncertainty are explicit
- real providers contribute materially beyond mock fallback
- the top results are useful enough to save quickly

This calibration is still a heuristic gate, not a final editorial truth. It is designed to expose weak retrieval, weak ranking, and missing provider evidence early.
