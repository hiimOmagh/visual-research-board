# Evidence Pack Export v2

Version: v2.4.0

Evidence Pack v2 turns a creator research session into a local-first deliverable.

It includes:

- project brief
- query plan
- saved references grouped by board section
- source URLs
- attribution text
- usage/rights notes
- review notes
- missing coverage
- rejected/weak references summary
- timestamp
- fixture/demo mode disclosure when applicable

The export flow is intentionally local-first. It does not require paid APIs, OAuth, or live scraping. Demo fixtures must remain clearly labeled and must not be represented as live retrieval evidence.

Validation:

```bash
npm run evidence-pack:v2:check
npm run qa
npm run verify:ci-parity
```
