# Release Candidate Checklist — v2.1.3

## Required checks

```bash
npm run clean:rc
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## Public-demo checks

- Demo does not require private credentials.
- Demo does not imply live scraping.
- Demo does not imply legal clearance.
- Demo does not imply source-verification guarantees.
- Unavailable providers are disabled, skipped, or clearly labeled.
- Manual/private workflow remains visible and usable.
- Public-facing copy explains limitations.

## Security checks

- Provider keys remain server-only.
- No public secret-like environment variables are used.
- Runtime diagnostics expose only redacted key presence.
- No fixture, export, or public-demo file contains real or fake-looking secrets.

## Export checks

- Evidence-pack exports contain source metadata and uncertainty.
- Exports do not contain provider credentials.
- Attribution output remains assistance, not legal clearance.

## Pass condition

The release candidate can be considered demo-ready only when:

```text
npm run public-demo:check: passed
npm run qa:public-demo: passed
npm run security:key:check: passed
npm run qa: passed
npm run typecheck: passed
npm run lint: passed
npm run build: passed
```
