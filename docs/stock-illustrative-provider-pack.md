# v1.1.0 — Stock/Illustrative Provider Pack

v1.1.0 adds optional free-key stock/illustrative image retrieval for visual inspiration, thumbnails, moodboards, and background candidates.

## Providers

| Provider | Env key | Default | Intended use |
|---|---|---:|---|
| Pixabay | `PIXABAY_API_KEY` | Off | Broad stock/illustrative photos and images. |
| Pexels | `PEXELS_API_KEY` | Off | High-quality photo candidates for moodboards and thumbnails. |
| Unsplash | `UNSPLASH_ACCESS_KEY` | Off | Editorial-style stock/photo references. |

## Classification

Every stock result is normalized as:

```ts
source_access_mode: "stock_illustrative"
rights_status: "likely_reusable"
reuse_risk: "medium"
```

This prevents stock results from being mistaken for archival, institutional, or factual evidence.

## Routing

The query planner routes stock variants to these providers when image-oriented modes are active, especially:

- `thumbnail_inspiration`
- `design_moodboard`
- `youtube_documentary`

The added query branches include:

- stock photo
- editorial photo reference
- background photo

## Policy boundary

Stock providers are allowed as optional free-key sources, but publication terms still require verification. The app must not present stock candidates as legal clearance or as primary factual evidence.

## Validation

```bash
npm run stock:providers:check
npm run qa
```
