# Release Checklist — v1.0.0 stable

Run before publishing or deploying.

## Required local/CI commands

```bash
npm ci
npm run qa
npm run typecheck
npm run lint
npm run build
npm run build:static
```

Or use the consolidated no-browser gate:

```bash
npm run test:ci:no-browser
```

## QA evidence

After `npm run qa`, inspect:

```text
artifacts/full-qa-gate-report.json
```

The report must show:

```text
status: passed
failed_gate_count: 0
app_version: 1.0.0
```

## Manual browser checks

- Create project.
- Search mock topic.
- Toggle providers.
- Confirm free/open providers and optional stock providers are labeled correctly.
- Launch Reference Search Hub links and verify they open externally.
- Save result.
- Edit note and tags.
- Assign section.
- Add claim and link saved source.
- Run coverage/bias review.
- Preview evidence pack exports.
- Preview attribution exports.
- Export JSON, Markdown, CSV, HTML evidence pack, attribution pack, and library backup.
- Import the same library file and verify conflict summary.
- Restore search snapshot.
- Duplicate and delete project.
- Refresh page and verify persistence.
- Verify license/risk labels remain candidate-style.

## Deployment checks

- Vercel/Next runtime build loads the dark workspace, not README.
- GitHub Pages static demo loads the dark workspace using client-side mock search.
- Static demo clearly reports that real providers require a Next.js runtime.
- CI uploads `artifacts/full-qa-gate-report.json` as `full-qa-gate-report`.

## v1.0.0 security/key handling

- Run `npm run security:key:check`.
- Confirm provider keys use server-only env names, not `NEXT_PUBLIC_*`.
- Confirm provider runtime diagnostics show key presence only as redacted status.

## v1.0.0 public-demo release candidate

Run:

```bash
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
```

Confirm:

- Public demo does not require private credentials.
- Public demo does not imply live scraping.
- Public demo does not imply legal clearance.
- Unavailable providers are clearly disabled, skipped, or labeled.
- Exports do not contain secrets or provider credentials.

## v1.0.0 — Release Warning Cleanup

This micro-patch removes targeted lint warnings and updates CI action/runtime references while preserving v1.0.0 Public Demo Release Candidate and Security and Key Handling behavior.

Validation:

```bash
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## v1.0.0 public-demo evidence lock

Run:

```bash
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

Confirm the CI run passes and produces the `full-qa-gate-report` artifact.

## v1.0.0 hosted demo evidence review

Run:

```bash
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

Confirm the hosted demo evidence checklist before tagging.

## v1.0.0 public demo final acceptance

Run:

```bash
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run public-demo:final:check
```

Confirm the hosted demo, docs, and full QA artifact before tagging.

## v1.0.0 public demo stable release

Run:

```bash
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run public-demo:stable:check
```

Confirm the stable release checklist before tagging.
