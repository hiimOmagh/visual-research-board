# Review-Evidence Feedback Calibration — v0.2.9

`v0.2.9` closes the loop between manual saved-board reviews and ranking calibration.

## What changed

Manual review labels are no longer terminal export metadata only. Before each search, the active project converts reviewed saved references into a compact feedback profile:

- exact source signals from previously reviewed source URLs
- domain-level bias from repeatedly approved or rejected domains
- source-group bias from trusted or weak groups such as Commons, archives, stock, or social/search sources
- provider bias from previously reviewed provider output
- confidence damping when review evidence is sparse or contradictory

The search request carries this profile as `review_evidence_feedback`. Runtime and static-demo search paths apply it after provider retrieval, weak-case auto-tuning, and evidence-driven ranking/query tuning.

## Calibration rule

The feedback layer is conservative:

- approved references boost matching exact sources, domains, groups, and providers
- rejected or source-check references penalize matching signals
- sparse review sets produce low confidence and small adjustments
- contradictory domain feedback reduces confidence
- all adjustments are capped so manual feedback cannot overpower direct retrieval evidence

## UI evidence

The `ReviewEvidenceFeedbackPanel` displays:

- reviewed count and feedback confidence
- approved/rejected counts
- adjusted result count
- exact source matches
- positive and negative bias hits
- calibration delta before/after review feedback
- top domain, source-group, and provider bias entries
- warnings for sparse/conflicting feedback

## Export evidence

The Quality Review export now includes a review-evidence ranking feedback section so the saved board can be audited as a learning source, not only as a curation list.

## Validation

Run:

```bash
npm run review:evidence:check
npm run test:ci:no-browser
```

The check verifies that the feedback bridge exists in types, runtime search, static fallback search, UI diagnostics, exports, and QA gates.
