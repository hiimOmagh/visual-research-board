# RUNBOOK v2.4.0 - Evidence Pack Export v2 + Usable Creator Output

## Objective

Turn the Creator Workflow into a usable creator deliverable by adding Evidence Pack v2 export preview and local-first Markdown/JSON outputs.

## Validation

```bash
node -p "require('./package.json').version"
npm run evidence-pack:v2:check
npm run creator-workflow:mvp:check
npm run creator-workflow:interaction:check
npm run creator-workflow:usability:check
npm run creator-session:quality:check
npm run route-surface:check
npm run lint
npm run qa
npm run typecheck
npm run verify:ci-parity
```

## Non-goals preserved

- no packaging work
- no archive gates
- no OAuth
- no paid APIs
- no live scraping
- no weakening of existing QA/release gates
