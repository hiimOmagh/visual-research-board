# v0.4.1 — Attribution Generator Upgrade

v0.4.1 upgrades attribution from a single generic draft line into a license-aware attribution generator.

## Purpose

The attribution layer is a drafting aid for research and production workflows. It does not provide legal clearance. Every exported line keeps source, rights, reuse-risk, and warning context attached so reference-only or unclear-rights material is not accidentally treated as safe production media.

## Formats

The generator supports:

- Simple attribution
- Creator / title / source / license
- Markdown citation block
- Video description block
- Article source list
- Rough bibliography entry

## Clearance labels

Each item is classified as one of:

- `attribution_ready_candidate`
- `verify_before_use`
- `reference_only`
- `do_not_use`

These are workflow labels, not legal decisions.

## Warnings

The generator flags:

- unknown or unclear license metadata
- missing license URLs for public-domain / Creative-Commons candidates
- check-required or unknown rights status
- reference-only items
- restricted / rejected items
- manual-reference imports
- non-low reuse risk
- metadata gaps
- manual review requests for source checking or rejection

## Export integration

v0.4.1 adds or upgrades:

- multi-format attribution Markdown export
- single-format attribution Markdown export
- attribution JSON export
- attribution CSV export
- attribution audit inside JSON/library diagnostics
- attribution line generation inside Evidence Pack v1
- API export formats:
  - `attribution_json`
  - `attribution_markdown`
  - `attribution_csv`

## Validation

```bash
npm run attribution:generator:check
npm run qa
```
