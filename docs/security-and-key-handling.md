# v1.5.0 — Security and Key Handling

This release hardens provider credentials for the free-source visual research workflow.

## Rules

- Provider keys are server-only environment variables.
- Provider keys must never use `NEXT_PUBLIC_` names.
- Runtime diagnostics expose only presence and readiness, never raw key values.
- Configured keys are shown as `configured:redacted`.
- Static demo mode cannot execute provider keys; it remains mock/manual-reference only.
- The Reference Search Hub remains manual and does not require secrets.

## Server-only provider keys

Tracked server-side variables:

- `SMITHSONIAN_API_KEY`
- `EUROPEANA_API_KEY`
- `RIJKSMUSEUM_API_KEY`
- `NYPL_API_KEY`
- `DPLA_API_KEY`
- `PIXABAY_API_KEY`
- `PEXELS_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `BRAVE_SEARCH_API_KEY`
- `TAVILY_API_KEY`

## Diagnostics

The provider runtime report now includes `key_security`:

- configured key count
- missing key count
- public-env leak count
- redacted entry list
- warnings for `NEXT_PUBLIC_*` secret-like names

## Validation

Run:

```bash
npm run security:key:check
npm run qa:security
npm run qa
```

## Failure modes blocked

- raw provider key rendered in UI
- raw provider key exported in evidence packs
- provider adapter reading ad-hoc `process.env.X_API_KEY`
- public client-bundle key naming through `NEXT_PUBLIC_*API_KEY`
- confusing static-demo provider readiness
