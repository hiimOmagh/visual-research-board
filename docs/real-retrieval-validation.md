# Real Retrieval Validation — v0.3.0

This release adds a retrieval-evidence gate. The goal is not to claim that the app crawls the whole web. The realistic target is broad multi-provider retrieval with measurable evidence: candidate volume, image density, source diversity, saveable candidates, and provider activity.

## Gate targets

- Quick mode: target 12 deduped candidates.
- Standard mode: target 30 deduped candidates.
- Deep mode: target 40 candidates.

A search passes the MVP retrieval gate when it reaches the depth target, has at least 25% saveable candidates, and represents at least three source groups.

## Evidence fields

The API and static mock fallback now return `diagnostics.retrieval_evidence` with candidate volume, source-group diversity, active provider count, query breadth, broad retrieval score, verdict, and warnings.

## Local validation protocol

Run:

```bash
npm install
npm run qa
npm run typecheck
npm run lint
npm run build
```

Use these topics as retrieval probes: Hannibal crossing the Alps, Carthage ruins documentary, Tunisia solar energy policy, ancient naval warfare maps, public domain Roman mosaics, and editorial geopolitics thumbnail inspiration.
