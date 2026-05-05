# v0.5.1 — UX Reliability + Empty State Polish

This release makes the visual research board easier to enter, inspect, and demo without adding a new research concept.

## Scope

- Adds a workflow readiness audit for the full path: project, providers, search, Reference Search Hub, saved board, manual review, claims, coverage audit, and export.
- Adds a guided UX reliability panel with readiness score, actionable checklist, reliability notes, and next actions.
- Adds a deterministic demo project so new users can see saved references, review evidence, claim links, rights labels, and exportable evidence without needing provider keys.
- Improves result-grid empty states so the UI distinguishes between no search yet, zero returned results, and filters hiding existing results.
- Clarifies provider setup language for free-core, free-key, optional API, and manual reference workflows.

## Design rules

- Empty states must tell the user what is empty and what to do next.
- Search engines remain manual reference launchers only; no scraping behavior is introduced.
- Demo data is clearly a local fixture and does not pretend to be live provider evidence.
- Provider setup remains explicit: free-core sources are default, free-key providers require environment variables, optional API providers remain disabled by default.

## Validation

Run:

```bash
npm run ux:reliability:check
npm run qa
```
