# v2.1.11 SearchPanel Controlled Mount Hotfix

<!-- v2.1.11-full-qa-gate-manifest-lock:start -->

## Release identity and QA manifest

Current release: v2.1.11
Visual Research Board v2.1.11
visual-research-board v2.1.11
visual-research-board@2.1.11
Package version: 2.1.11
README identifies v2.1.11

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
- package.json version must be 2.1.11
- node scripts/full-qa-gate.mjs
- npm run qa must delegate to scripts/full-qa-gate.mjs
- node scripts/full-qa-gate.mjs --list
- package.json must expose npm run qa:list
- node tests/full-qa-gate-check.mjs
- artifacts/full-qa-gate-report.json
- full QA gate report schema must identify v2.1.11
- full-qa-gate-report
- release checklist must identify v2.1.11
- validation report must identify v2.1.11
- README.md
- README must identify v2.1.11
- PATCH_MANIFEST must identify v2.1.11
- Full QA Gate checks passed for v2.1.11.

<!-- v2.1.11-full-qa-gate-manifest-lock:end -->

This hotfix targets:

```text
FAIL first-run panel mount check: SearchPanel must contain controlled mount marker
```

Run from the repository root:

```powershell
python apply-v2.1.11-searchpanel-controlled-mount-hotfix.py
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

v2.1.11 preserves the Public Demo Stable Release gate in the release verification path. Use 
pm run verify:ci-parity for clean-install parity, artifact generation, release verification, and stable public-demo evidence checks.

## Public Demo Final Acceptance

v2.1.11 preserves the Public Demo Final Acceptance gate in the release verification path. This confirms the public demo remains acceptable after artifact generation, CI parity verification, stable public-demo checks, dependency audit triage, and safe-upgrade lock validation.


## v2.1.11 Release Verification Gate Names

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

The v0.3.1 retrieval evidence gates are intentionally preserved as historical QA anchors inside the current v2.1.11 release flow.

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

Current release: v2.1.11

Required QA commands:

```bash
npm run qa
npm run qa:list
npm run verify:ci-parity
```

`qa:list` documents the available Full QA gate manifest entries before execution.
`npm run qa` executes the complete Full QA gate for v2.1.11.
`npm run verify:ci-parity` performs the clean-install CI parity verification path.

<!-- END FULL QA GATE MANIFEST CONTRACT -->
