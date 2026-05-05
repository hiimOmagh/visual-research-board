# Release Checklist — v0.7.0 stable

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
app_version: 0.7.0
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
