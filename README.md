# Visual Research Board v0.5.0

A free-source visual research workspace for discovering, saving, reviewing, ranking, organizing, claim-mapping, auditing, attributing, and exporting image/source evidence.

## Current release

**v0.5.0 — UX Reliability + Empty State Polish**

This release adds:

- guided workflow readiness audit
- UX reliability panel
- deterministic demo project loading
- demo topic setup
- clearer empty states for no-search, no-results, and filter-hidden states
- provider setup clarity for free-core, free-key, optional API, and manual reference launchers
- dedicated QA check: `npm run ux:reliability:check`

## Core workflow

```text
Project → free-source search → manual reference launchers → saved board → quality review → claim mapping → coverage/bias audit → attribution/evidence-pack export
```

## Validation

```bash
npm run qa
npm run ux:reliability:check
```

Full TypeScript/lint/build validation requires installed Next/React/Node/Tailwind dependencies.

## Historical validation commands retained in QA

Earlier release gates remain part of the current QA chain, including the v0.3.1 provider/runtime evidence path:

```bash
npm run deployed:browser:check
npm run topic:matrix:check
npm run evidence:deploy
```

The app version is v0.5.0; references to v0.3.1 describe retained historical gates, not the current release version.

Compatibility aliases expected by retained gates:

```bash
npm run deployed:browser:test
npm run topic:matrix:test
```
