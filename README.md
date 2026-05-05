# Visual Research Board v0.5.1

A free-source visual research workspace for discovering, saving, reviewing, ranking, organizing, claim-mapping, auditing, attributing, exporting, backing up, and restoring image/source evidence.

## Current release

**v0.5.1 — Local Storage + Import/Export Hardening**

This release adds:

- schema-aware project-library import validation
- backup-envelope export with integrity counts and checksum metadata
- corrupted/unreadable JSON rejection before merge
- migration-required and partial-import reports
- visible storage import validation summaries
- safer restore path for backup envelopes
- dedicated QA check: `npm run storage:hardening:check`

## Previous UX reliability layer

v0.5.1 preserves the v0.5.0 reliability layer:

- guided workflow readiness audit
- UX reliability panel
- deterministic demo project loading
- demo topic setup
- clearer empty states for no-search, no-results, and filter-hidden states
- provider setup clarity for free-core, free-key, optional API, and manual reference launchers
- dedicated QA check: `npm run ux:reliability:check`

## Core workflow

```text
Project → free-source search → manual reference launchers → saved board → quality review → claim mapping → coverage/bias audit → attribution/evidence-pack export → backup/restore
```

## Validation

```bash
npm run qa
npm run storage:hardening:check
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

The app version is v0.5.1; references to v0.3.1 describe retained historical gates, not the current release version.

Compatibility aliases expected by retained gates:

```bash
npm run deployed:browser:test
npm run topic:matrix:test
```
