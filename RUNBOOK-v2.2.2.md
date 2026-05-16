# v2.2.2 — Creator Workflow Usability Depth Pass

## Objective

Improve the usable creator research path without adding packaging work or live-provider complexity.

## Scope

- Strengthen brief-to-query transformation.
- Add visible next-step guidance.
- Support saved-reference note editing.
- Support moving saved references between board sections.
- Improve evidence-pack export preview coverage.
- Preserve transparent local-first fixture/demo mode.

## Non-goals

- No release archive work.
- No OAuth.
- No paid APIs.
- No live scraping.
- No fake live claims.

## Validation

```bash
node -p "require('./package.json').version"
npm run creator-workflow:usability:review
npm run creator-workflow:usability:check
npm run creator-workflow:mvp:check
npm run creator-workflow:interaction:check
npm run qa
npm run verify:ci-parity
```

## Acceptance

- Version is `2.2.2`.
- Creator workflow usability depth check passes.
- Existing creator workflow MVP and interaction checks pass.
- Full QA remains green.
- CI parity remains green.
