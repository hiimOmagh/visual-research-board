# Public Demo — v2.2.0

Visual Research Board v2.2.0 is a Public Demo Release Candidate.

The demo is designed to be inspectable without private credentials. It must not imply live scraping, legal clearance, source-verification guarantees, or unbounded provider access.

## What the demo can show

- Manual/private visual research workflow
- Source-aware reference organization
- Review and evidence packaging
- Attribution assistance
- Coverage and bias audit surfaces
- Provider readiness and unavailable-provider states
- Export-oriented evidence workflow

## Limitations

- It does not provide legal clearance.
- It does not guarantee source verification.
- It does not guarantee rights status.
- It does not expose provider keys.
- It does not require private credentials.
- It does not make unavailable providers appear active.

## Provider behavior

Provider keys are optional and must remain server-only. If a provider is unavailable, missing a key, or disabled, the UI must show that state clearly.

## Public-demo validation

Run:

```bash
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
```

## Release posture

v2.2.0 is a release candidate. It is suitable for public inspection only if the public-demo, security, and full QA gates pass.
