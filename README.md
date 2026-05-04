# Visual Research Board

`v0.4.1 attribution generator upgrade package`

A free-source visual research board for discovering, reviewing, ranking, organizing, and exporting image/source evidence with rights-risk labels, claim mapping, coverage audits, evidence packs, and license-aware attribution drafts.

## v0.4.1 focus

v0.4.1 upgrades attribution from a single generic line into a **license-aware attribution generator**.

It supports:

- simple attribution
- creator/title/source/license attribution
- Markdown citation blocks
- video description blocks
- article source-list entries
- rough bibliography entries
- attribution JSON/Markdown/CSV exports
- clearance labels: attribution-ready candidate, verify before use, reference only, do not use
- warning trails for unclear rights, missing license URLs, reference-only material, rejected material, and metadata gaps

## Validation

```bash
npm run attribution:generator:check
npm run qa
```

Full TypeScript/lint validation still requires project dependencies to be installed locally:

```bash
npm install
npm run typecheck
npm run lint
```

## Earlier evidence gates retained

The current package preserves earlier v0.3.1 evidence gates and commands:

```bash
npm run deployed:browser:test
npm run topic:matrix:test
```

These remain part of the broader QA/evidence path even though the current release focus is v0.4.1.
