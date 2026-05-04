# Retrieval Weak-Case Auto-Tuning — v0.2.9

`v0.2.9` adds a weak-case correction layer on top of the v0.2.3 retrieval creator gate.

The goal is not to claim literal all-web crawling. The goal is to make the system react when a search is visibly weak.

## What gets tuned

The auto-tuning pass watches two diagnostic layers:

- `retrieval_evidence` — breadth, candidate count, image count, saveable count, and source-group diversity.
- `quality_calibration` — relevance, visual quality, strong source count, clear license count, real-provider share, and top-10 quality.

If either layer fails, the search route creates a tuned second pass.

## Auto-tuning actions

Supported action labels:

- `expand_queries`
- `increase_visual_branches`
- `increase_commons_archive_bias`
- `increase_source_diversity`
- `increase_license_clarity_bias`
- `increase_relevance_precision`
- `increase_real_provider_bias`
- `apply_diversity_rerank`

These actions are stored in:

```text
SearchDiagnostics.auto_tuning.actions
```

## What changes during a tuned pass

A tuned pass can:

1. prepend weak-case query branches before normal plan queries;
2. expand source targets toward image, web, Commons, and archive sources;
3. rerun provider adapters with the tuned plan;
4. merge baseline and tuned raw results;
5. deduplicate the merged candidate pool;
6. apply provider/source/license/visual rank adjustments;
7. apply diversity-aware reranking so the top results are not dominated by one source class.

## Diagnostics exposed

`SearchDiagnostics.auto_tuning` includes:

- whether tuning was applied;
- initial/final retrieval verdict;
- initial/final quality verdict;
- candidate delta;
- calibration-score delta;
- provider weights;
- added queries;
- tuned source targets;
- warnings used as tuning signals.

## Runtime switch

Disable the tuned second provider pass with:

```bash
VISUAL_RESEARCH_BOARD_DISABLE_AUTO_TUNING=true
```

When disabled, the API still reports why tuning would have been recommended.

## Static demo limitation

GitHub Pages/static-demo mode cannot call server-side live providers. In that mode, auto-tuning is limited to query visibility and client-side reranking of mock results.

## Acceptance target

For a useful creator workflow, a tuned deep search should move weak topics toward:

```text
40+ candidates
20+ relevant candidates
12+ strong candidates
3–4 source groups in top results
clear source URLs for every saved item
cautious license/risk labels for every saved item
```
