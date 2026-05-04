# Provider Result Inspector — v0.2.10

`v0.2.10` adds a real provider result inspector to make retrieval quality auditable before more ranking work is added.

## Purpose

The inspector answers a narrow operational question:

```text
Which providers are producing useful visual candidates, and which results need human review?
```

It does not attempt to prove that an image is safe for commercial use. It surfaces evidence for manual review.

## Metrics captured

For every provider, the app now records:

- provider status
- total result count
- image count
- web/context count
- clear-license candidate count
- low-risk candidate count
- high-risk or avoid count
- average overall score
- average relevance score
- average visual-quality score
- average source-credibility score
- top result IDs
- manual review candidate IDs
- warnings

## Manual review candidate logic

A result is flagged as a manual review candidate when it has weak risk, license, relevance, visual-quality, source-credibility, or thumbnail signals.

## Diagnostic field

Search diagnostics now include `provider_result_inspection`.

## Use in the development loop

Use the inspector before tuning rankings:

```text
1. Run real provider search.
2. Inspect provider-level candidate quality.
3. Save potentially useful references.
4. Manually review saved items.
5. Export Quality Review evidence.
6. Tune ranking/query behavior from evidence, not assumptions.
```
