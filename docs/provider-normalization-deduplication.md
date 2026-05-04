# v0.3.0 — Provider Normalization + Deduplication

This release adds a normalization gate between provider retrieval and ranking/export.

## Purpose

Free/open providers often return the same image through different source URLs, thumbnail URLs, mirrors, or file-size variants. v0.3.0 prevents those repeated records from polluting ranking, review, and export.

## What is normalized

- Canonical source URLs with tracking parameters removed.
- Canonical image URLs and thumbnail URLs.
- Normalized title fingerprints.
- Image asset keys, including provider-specific resized filename variants.
- Duplicate match reasons: `source_url`, `image_url`, `thumbnail_url`, `title_domain`, `image_asset`, and `visual_shape`.
- Metadata gaps such as missing visual asset, missing dimensions, unclear license, unclear rights status, missing description, and unknown source domain.

## What is preserved

Duplicates are merged, not silently discarded. The surviving result retains a `provider_sources` audit trail so the user can inspect which provider/source records contributed to the final candidate.

## Diagnostics

Search diagnostics now include `normalization_dedupe` with:

- raw, normalized, and deduped counts
- duplicate group count
- merged duplicate count
- unique canonical source count
- unique canonical image count
- metadata gap counts
- duplicate group samples
- warnings

## UI

The Search workspace now renders a **Normalization + deduplication** panel after the generated search plan. Result cards and the detail drawer surface duplicate-group size and metadata gaps.

## Validation

Run:

```bash
npm run normalization:dedupe:check
npm run qa
```
