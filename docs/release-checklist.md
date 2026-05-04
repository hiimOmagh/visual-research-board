# Release Checklist — v0.2.11 stable

Run before publishing or deploying.

```bash
npm install
npm run qa
npm run typecheck
npm run lint
npm run build
npm run build:static
```

Manual browser checks:

- Create project.
- Search mock topic.
- Toggle providers.
- Save result.
- Edit note.
- Assign section.
- Add custom section.
- Manual URL import.
- Preview JSON, Markdown, and template exports.
- Export JSON, Markdown, CSV, attribution, and library JSON.
- Import the same library file and verify conflict summary.
- Restore search snapshot.
- Duplicate and delete project.
- Refresh page and verify persistence.
- Verify license/risk labels remain candidate-style.

Deployment checks:

- Vercel/Next runtime build loads the dark workspace, not README.
- GitHub Pages static demo loads the dark workspace using client-side mock search.
- Static demo clearly reports that real providers require a Next.js runtime.
