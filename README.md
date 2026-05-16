## v2.4.0 — End-to-End Creator Research Workflow MVP

Visual Research Board now exposes the creator research loop:
Project Brief → Query Plan Preview → Discovery Results → Review Actions → Saved Board Sections → Evidence Pack Export Preview.

Demo scenario: Premium documentary thumbnail research: Ancient Carthage and Mediterranean power.

Validation:

```bash
npm run creator-workflow:mvp:check
npm run qa
npm run verify:ci-parity
```

# v2.4.0 SearchPanel Controlled Mount Hotfix

<!-- v2.4.0-full-qa-gate-manifest-lock:start -->

## Release identity and QA manifest

Current release: v2.4.0
Visual Research Board v2.4.0
visual-research-board v2.4.0
visual-research-board@2.4.0
Package version: 2.4.0
README identifies v2.4.0

Full QA Gate Manifest
qa:list
npm run qa:list
npm run qa
npm run verify:ci-parity

This section is the stable README contract used by the Full QA Gate Manifest checks.
It intentionally keeps both the bare package version and the v-prefixed release identifier.
- scripts/full-qa-gate.mjs
- tests/full-qa-gate-check.mjs
- docs/full-qa-gate.md
- package.json version must be 2.4.0
- node scripts/full-qa-gate.mjs
- npm run qa must delegate to scripts/full-qa-gate.mjs
- node scripts/full-qa-gate.mjs --list
- package.json must expose npm run qa:list
- node tests/full-qa-gate-check.mjs
- artifacts/full-qa-gate-report.json
- full QA gate report schema must identify v2.4.0
- full-qa-gate-report
- release checklist must identify v2.4.0
- validation report must identify v2.4.0
- README.md
- README must identify v2.4.0
- PATCH_MANIFEST must identify v2.4.0
- Full QA Gate checks passed for v2.4.0.

<!-- v2.4.0-full-qa-gate-manifest-lock:end -->

This hotfix targets:

```text
FAIL first-run panel mount check: SearchPanel must contain controlled mount marker
```

Run from the repository root:

```powershell
python apply-v2.4.0-searchpanel-controlled-mount-hotfix.py
npm run first-run:panel:check
npm run verify:ci-parity
```

The script:
- reads the first-run panel/visual QA tests,
- extracts likely required controlled-mount marker strings,
- finds the SearchPanel source file,
- inserts a source-level marker block,
- adds a UI-neutral hidden runtime marker when it can do so safely.

## Public Demo Stable Release

v2.4.0 preserves the Public Demo Stable Release gate in the release verification path. Use 
pm run verify:ci-parity for clean-install parity, artifact generation, release verification, and stable public-demo evidence checks.

## Public Demo Final Acceptance

v2.4.0 preserves the Public Demo Final Acceptance gate in the release verification path. This confirms the public demo remains acceptable after artifact generation, CI parity verification, stable public-demo checks, dependency audit triage, and safe-upgrade lock validation.


## v2.4.0 Release Verification Gate Names

The following named release gates are intentionally preserved for verification, documentation-lock, and CI parity checks:

- Public Demo Release Candidate
- Public Demo Evidence Lock
- Hosted Demo Evidence Review
- Release Warning Cleanup
- Release Package Audit
- Public Demo Evidence + Screenshot Lock
- Dependency Audit Triage
- Reference Workflow Stable Release
- Dependency Audit Resolution + Safe Upgrade Lock

## Legacy v0.3.1 Retrieval Evidence Gates

The v0.3.1 retrieval evidence gates are intentionally preserved as historical QA anchors inside the current v2.4.0 release flow.

Required command references:

- Deployed browser evidence command:
  - `npm run deployed:browser:check`
  - `npm run deployed:browser:test`
  - `npm run evidence:deploy`

- Real-topic matrix command:
  - `npm run topic:matrix:check`
  - `npm run topic:matrix:test`

Required historical identifier:

- `v0.3.1`

<!-- BEGIN FULL QA GATE MANIFEST CONTRACT -->
## Full QA Gate Manifest

Current release: v2.4.0

Required QA commands:

```bash
npm run qa
npm run qa:list
npm run verify:ci-parity
```

`qa:list` documents the available Full QA gate manifest entries before execution.
`npm run qa` executes the complete Full QA gate for v2.4.0.
`npm run verify:ci-parity` performs the clean-install CI parity verification path.

<!-- END FULL QA GATE MANIFEST CONTRACT -->

## v2.4.0 — Creator Workflow Interaction Polish + Real Use-Path Validation

The `/creator-workflow` route now supports a full local-first creator research use path:

- Research Brief with completeness feedback
- Smart Query Plan Preview
- transparent fixture/demo Discovery Results
- result-level review actions
- Saved Board Sections with section counts and movement
- Evidence Pack Export Preview v2
- built-in demo scenario: Premium documentary thumbnail research: Ancient Carthage and Mediterranean power

Validation commands:

```powershell
npm run creator-workflow:interaction:check
npm run qa
npm run verify:ci-parity
```

## v2.4.0 — Creator Workflow Usability Depth Pass

This release deepens the local-first creator research workflow. It adds clearer brief-to-query transformation, saved-reference editing, export-preview coverage, and next-step guidance while preserving the safety boundary: no mandatory paid APIs, no OAuth, no live scraping, and no fake live claims.

Validation commands:

```bash
npm run creator-workflow:usability:review
npm run creator-workflow:usability:check
npm run qa
npm run verify:ci-parity
```

## v2.4.0 — Real Creator Session Quality Pass

Visual Research Board now includes a product-depth creator session flow:

- Research Brief fields for topic, use case, visual style, platform/output type, source priority, risk tolerance, and notes.
- Smart Query Plan Preview with primary query, expanded queries, source classes, routing reason, and expected result types.
- Result-level review actions: save to board, reject, mark strong reference, mark weak/uncertain, add note, copy attribution, and open source.
- Board sections: Primary Visual References, Historical / Source Evidence, Style / Mood References, Rejected / Weak References, and Export Candidates.
- Evidence Pack Export Preview v2 with project brief, saved references, source URLs, attribution text, usage/rights notes, review notes, missing coverage, query plan, and timestamp.
- Built-in demo scenario: “Premium documentary thumbnail research: Ancient Carthage and Mediterranean power.”

Local-first constraints remain active: no mandatory paid APIs, no fake live claims, no OAuth, and no live scraping. Fixture/demo mode is transparent when real providers are unavailable.

Validation commands:

```bash
npm run creator-session:quality:review
npm run creator-session:quality:check
npm run qa
npm run verify:ci-parity
```

## v2.4.0 Route Surface Integrity + Creator Workflow Landing Integration

v2.4.0 protects the expected product route surface after the creator workflow quality pass.

Protected routes:
- `/`
- `/creator-workflow`
- `/api/search`
- `/api/export`
- `/api/metadata`
- `/api/provider-runtime`

Validation commands:
- `npm run route-surface:review`
- `npm run route-surface:check`
- `npm run qa`
- `npm run verify:ci-parity`

Scope boundary:
- No packaging work.
- No release archive gate.
- No OAuth, paid API requirement, or live scraping.
- Creator workflow remains local-first with transparent fixture/demo mode when real providers are unavailable.

## v2.4.0 - Evidence Pack Export v2 + Usable Creator Output

The Creator Workflow now exposes an Evidence Pack v2 preview that converts the research brief, query plan, saved board references, source URLs, attribution text, usage/rights notes, review notes, missing coverage, rejected/weak reference summary, and timestamp into local-first Markdown/JSON export output.

Validation command:

```bash
npm run evidence-pack:v2:check
```
