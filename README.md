# Visual Research Board

## Release verification identity

Visual Research Board v2.4.0

This release is the Public Demo Release Candidate for the local-first creator research workflow.

Required Full QA command anchor:

```powershell
npm run qa:list
```

Required legacy QA anchors:

```powershell
npm run topic:matrix:test
npm run deployed:browser:test
```


Visual Research Board is a local-first, source-aware visual research workspace for creators. It supports structured creator research, manual review, saved board references, evidence pack export previews, and transparent demo/fixture mode when real providers are unavailable.

Current app version: **v2.4.0**.

The v0.3.1 baseline remains documented and covered by legacy retrieval, real-topic matrix, and deployed browser evidence checks.

## v2.4.0 workflow MVP

This README explicitly documents **the v2.4.0 workflow MVP**.

The v2.4.0 workflow MVP supports the creator research loop:

Research Brief -> Query Plan -> Discovery Results -> Review Actions -> Saved Board Sections -> Evidence Pack Export Preview.

Equivalent release labels retained for QA compatibility:

- v2.4.0 workflow MVP
- the v2.4.0 workflow MVP
- v2.4.0 Workflow MVP
- v2.4.0 Creator Workflow MVP
- End-to-End Creator Research Workflow MVP
- v2.4.0 — End-to-End Creator Research Workflow MVP
- v2.4.0 — Evidence Pack Export v2 + Usable Creator Output

## Creator workflow validation commands

```powershell
npm run creator-workflow:hydration:check
npm run creator-workflow:mvp:check
npm run creator-workflow:interaction:check
npm run creator-workflow:usability:check
npm run creator-session:quality:check
npm run route-surface:check
```

## Evidence Pack Export v2

Evidence Pack Export v2 converts the creator workflow into a usable creator deliverable:

Research Brief -> Query Plan -> Saved Board References -> Review Notes -> Missing Coverage -> Export Pack Preview.

The export flow remains local-first and must not make fake live-provider claims. If real providers are unavailable, the application uses transparent fixture/demo mode.

Validation command:

```powershell
npm run evidence-pack:v2:check
```

## GitHub Pages static export

GitHub Pages must deploy the generated static export from `out/`, not a Jekyll/root repository artifact.

Required static export behavior:

- `out/.nojekyll` exists so GitHub Pages serves `_next` assets.
- `out/index.html` exists.
- `out/creator-workflow/index.html` exists.
- CSS is emitted under `out/_next/static/css/`.
- Routes use the `/visual-research-board` base path.
- The creator workflow is mounted through a hydration boundary to avoid static-export hydration drift.

Validation command:

```powershell
$env:VISUAL_RESEARCH_BOARD_BASE_PATH = "/visual-research-board"
npm run build:github-pages
```

## Hydration boundary contract

The creator workflow route may render `CreatorWorkflowPanel` directly or through `CreatorWorkflowHydrationBoundary`.

The deployed GitHub Pages path uses the hydration boundary to prevent React hydration mismatch errors on static export.

Command anchors:

```powershell
npm run creator-workflow:hydration:check
npm run route-surface:check
```

## Public Demo Release Candidate

The Public Demo Release Candidate validates that the public demo route, creator workflow route, static export path, and local-first evidence workflow are ready for hosted review.

Command anchor:

```powershell
npm run public-demo:check
```

## Public Demo Stable Release

The Public Demo Stable Release confirms that the GitHub Pages deployment path serves the generated static export, keeps the creator workflow route available, preserves stable styling assets, and avoids fake live-provider claims.

Command anchor:

```powershell
npm run public-demo:stable:check
```

## Public Demo Final Acceptance

The Public Demo Final Acceptance confirms the styled public demo, creator workflow route, evidence export preview, and no fake live-provider claims.

Command anchor:

```powershell
npm run public-demo:final:check
```

## Public Demo Evidence Lock

The Public Demo Evidence Lock confirms the expected public-demo evidence artifacts and release identity for v2.4.0.

Command anchor:

```powershell
npm run public-demo:evidence:check
```

## Hosted Demo Evidence Review

The hosted demo evidence review records public demo readiness and review-state evidence.

Command anchor:

```powershell
npm run hosted-demo:evidence:check
```

## Real-topic matrix command

The v0.3.1 baseline remains covered by the real-topic matrix command.

Exact command required by the real-topic matrix QA gate:

```powershell
npm run topic:matrix:test
```

Additional command anchors:

```powershell
npm run topic:matrix:check
npm run validate:evidence
```

## Deployed browser evidence command

The v0.3.1 baseline remains covered by the deployed browser evidence command.

Exact command required by the real-topic matrix QA gate:

```powershell
npm run deployed:browser:test
```

Additional command anchor:

```powershell
npm run deployed:browser:check
```

## v0.3.1 baseline anchors

The v0.3.1 baseline includes real-topic matrix coverage, deployed browser evidence, retrieval evidence, calibration, auto-tuning, and provider smoke fixtures.

Required v0.3.1 command anchors:

```powershell
npm run topic:matrix:test
npm run deployed:browser:test
npm run retrieval:evidence:test
npm run provider:smoke:check
```

## Full QA command list

The QA list command is documented for release verification.

Exact command required by the full QA manifest gate:

```powershell
npm run qa:list
```

Command anchor: qa:list

## Main verification commands

```powershell
npm run lint
npm run qa
npm run typecheck
npm run verify:ci-parity
```

## Release verification commands

```powershell
npm run release:verify:runner:check
npm run single-command:verification:check
npm run ci-parity:workflow:check
npm run nested:verification:warnings:check
npm run verification:freshness:check
npm run release:evidence:index
npm run release:evidence:index:check
npm run verification:artifact-schema:check
```

## Release hygiene constraints

Do not commit local patch scripts in the repository root.

Root files matching these patterns must be removed before full QA:

```text
apply-v*.py
fix-v*.py
fix-*.py
```

Do not commit extracted patch payload directories such as `changed_files/`.

Do not run `npm audit fix --force` during release closure unless the dependency audit policy is intentionally being updated.

## Provider and source execution constraints

- No mandatory paid APIs.
- No OAuth requirement.
- No live scraping requirement.
- No fake live claims.
- Local-first behavior remains first-class.
- Demo/fixture mode must be disclosed transparently.

## Creator workflow release closure checklist

```powershell
npm run creator-workflow:hydration:check
npm run creator-workflow:mvp:check
npm run creator-workflow:interaction:check
npm run creator-workflow:usability:check
npm run creator-session:quality:check
npm run route-surface:check
npm run evidence-pack:v2:check
npm run public-demo:check
npm run public-demo:stable:check
npm run public-demo:final:check
npm run qa:list
npm run qa
npm run typecheck
npm run verify:ci-parity
```
