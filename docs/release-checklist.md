# Release Checklist — v2.2.0 stable

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
app_version: 2.2.0
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

## v2.2.0 security/key handling

- Run `npm run security:key:check`.
- Confirm provider keys use server-only env names, not `NEXT_PUBLIC_*`.
- Confirm provider runtime diagnostics show key presence only as redacted status.

## v2.2.0 public-demo release candidate

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

## v2.2.0 — Release Warning Cleanup

This micro-patch removes targeted lint warnings and updates CI action/runtime references while preserving v2.2.0 Public Demo Release Candidate and Security and Key Handling behavior.

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

## v2.2.0 public-demo evidence lock

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

## v2.2.0 hosted demo evidence review

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

## v2.2.0 public demo final acceptance

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

## v2.2.0 public demo stable release

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

## v2.2.0 reference intelligence layer

Run:

```bash
npm run reference:intelligence:check
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
npm run reference:intelligence:check
```

## v2.2.0 broad reference result model

Run:

```bash
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run broad-reference:model:check
```

## v2.2.0 broad web image discovery

Run:

```bash
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run broad-discovery:check
```

## v2.2.0 social reference discovery

Run:

```bash
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run social-reference:check
```

## v2.2.0 book bibliographic discovery

Run:

```bash
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run book-reference:check
```

## v2.2.0 reference activation pack

Run:

```bash
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run reference-activation:check
```

## v2.2.0 activation pack UI integration

Run:

```bash
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run activation-pack:ui:check
```

## v2.2.0 activation pack export preview

Run:

```bash
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run activation-pack:export-preview:check
```

## v2.2.0 activation pack export integration

Run:

```bash
npm run activation-pack:export:check
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run activation-pack:export:check
```

## v2.2.0 reference workflow stable release

Run:

```bash
npm run reference-workflow:stable:check
npm run activation-pack:export:check
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run reference-workflow:stable:check
```

## v2.2.0 stable release hygiene

Run:

```bash
npm run stable:hygiene:check
npm run reference-workflow:stable:check
npm run activation-pack:export:check
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run stable:hygiene:check
```

Do not run `npm audit fix --force` in this release.

## v2.2.0 dependency audit triage

Run:

```bash
npm run dependency:audit:triage:check
npm run stable:hygiene:check
npm run reference-workflow:stable:check
npm run activation-pack:export:check
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run dependency:audit:triage:check
```

Do not run `npm audit fix --force` in this release.

## v2.2.0 public demo evidence screenshot lock

Run:

```bash
npm run public-demo:screenshot:check
npm run dependency:audit:triage:check
npm run stable:hygiene:check
npm run reference-workflow:stable:check
npm run activation-pack:export:check
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
npm run broad-reference:model:check
npm run reference:intelligence:check
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
npm run public-demo:screenshot:check
```

Do not add new product features in this release.

## v2.2.0 release package audit

Run:

```bash
npm run release:package:audit:check
npm run public-demo:screenshot:check
npm run dependency:audit:triage:check
npm run stable:hygiene:check
npm run reference-workflow:stable:check
npm run activation-pack:export:check
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
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
npm run release:package:audit:check
```

## v2.2.0 unified release verification runner

Run:

```bash
npm ci
npm run verify:release
npm run release:verify:runner:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run verify:release
```

## v2.2.0 first-run UX workflow clarity

Run:

```bash
npm ci
npm run first-run:ux:check
npm run verify:release
npm run qa
npm run typecheck
npm run lint
npm run build
npm run verify:release
```

## v2.2.0 controlled first-run panel mount

Run:

```bash
npm ci
npm run first-run:panel:check
npm run first-run:ux:check
npm run verify:release
npm run qa
npm run typecheck
npm run lint
npm run build
npm run verify:release
```

## v2.2.0 first-run visual QA screenshot evidence

Run:

```bash
npm ci
npm run first-run:visual:evidence
npm run first-run:visual:check
npm run first-run:panel:check
npm run first-run:ux:check
npm run verify:release
npm run qa
npm run typecheck
npm run lint
npm run build
npm run verify:release
```

## v2.2.0 first-run evidence artifact review

Run:

```bash
npm ci
npm run first-run:visual:evidence
npm run first-run:evidence-review
npm run first-run:evidence-review:check
npm run first-run:visual:check
npm run first-run:panel:check
npm run first-run:ux:check
npm run verify:release
npm run qa
npm run typecheck
npm run lint
npm run build
npm run verify:release
```

## v2.2.0 first-run demo script

Run:

```bash
npm ci
npm run first-run:visual:evidence
npm run first-run:evidence-review
npm run first-run:demo-script
npm run first-run:demo-script:check
npm run first-run:evidence-review:check
npm run first-run:visual:check
npm run first-run:panel:check
npm run first-run:ux:check
npm run verify:release
npm run qa
npm run typecheck
npm run lint
npm run build
npm run verify:release
```

## v2.2.0 single-command verification

Normal local validation:

```bash
npm run verify:all
```

Clean install parity:

```bash
npm run verify:ci-parity
```

Debug-only fallback:

```bash
npm run single-command:verification:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## v2.2.0 CI parity workflow badge

```bash
npm run ci-parity:workflow:check
npm run verify:all
npm run verify:ci-parity
```

## v2.2.0 verification freshness lock

Normal local validation:

```bash
npm run verify:all
```

Clean install parity:

```bash
npm run verify:ci-parity
```

Dedicated check:

```bash
npm run verification:freshness:check
```

## v2.2.0 verification artifact schema lock

Normal local validation:

```bash
npm run verify:all
```

Clean install parity:

```bash
npm run verify:ci-parity
```

Dedicated checks:

```bash
npm run verification:artifact-schema:check
npm run release:evidence:index
npm run release:evidence:index:check
```
