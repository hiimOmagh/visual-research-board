# v0.4.0 — Evidence Pack Export v1

## Purpose

v0.4.0 converts the saved board into an explicit evidence pack instead of only a generic source list.

The export separates saved items into four production buckets:

1. **Reusable / likely safe candidates** — low-risk items with public-domain, open-license, or likely-reusable metadata.
2. **Check required before use** — useful sources that still need rights, metadata, source, or editorial verification.
3. **Reference-only discovery leads** — inspiration and lead-generation material that must not be published without independent clearance.
4. **Restricted, rejected, or avoid** — high-risk, restricted, avoid-grade, or manually rejected material kept only for audit trail.

## Export formats

Evidence Pack v1 supports:

- JSON evidence pack
- Markdown evidence pack
- CSV evidence pack
- HTML evidence pack preview/download

The existing source audit, production brief, visual moodboard, attribution pack, quality review, claim evidence, and coverage audit templates remain available.

## Included evidence

Each evidence-pack item carries:

- source URL and domain
- image/thumbnail URL when available
- provider and source group
- board section and section kind
- rights status
- source access mode
- reuse risk
- risk label
- license label and license URL when available
- manual review verdict
- linked claims and relation labels
- notes and tags
- attribution draft line
- warning trail

## Guardrails

Evidence pack buckets are workflow labels, not legal clearance. The app must keep reference-only and restricted/rejected material visibly separated from reusable candidates.

## Validation

Run:

```bash
npm run evidence:pack:check
npm run qa
```
