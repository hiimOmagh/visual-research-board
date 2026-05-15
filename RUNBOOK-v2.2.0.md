# RUNBOOK v2.2.0 — End-to-End Creator Research Workflow MVP

## Purpose

Validate that Visual Research Board now exposes the full creator research loop instead of only release-hardening infrastructure.

## Commands

```powershell
node -p "require('./package.json').version"
npm run creator-workflow:mvp:check
npm run qa
npm run verify:ci-parity
```

## Expected result

- `node -p` returns `2.2.0`.
- `npm run creator-workflow:mvp:check` passes.
- `npm run qa` passes.
- `npm run verify:ci-parity` passes.

## Product acceptance

The app must expose:

1. Research Brief panel.
2. Smart Query Plan Preview.
3. Discovery Results with review actions.
4. Saved Board Sections.
5. Evidence Pack Export Preview v2.
6. Built-in Carthage documentary-thumbnail demo scenario.
7. Transparent fixture/demo mode when providers are unavailable.

## Non-goals

- No packaging work.
- No release archive gate.
- No OAuth.
- No mandatory paid APIs.
- No fake live scraping claims.

# RUNBOOK v2.2.0 — Creator Research Workflow MVP

Purpose: validate the local-first creator research loop without packaging work.

Core validation:
1. `npm run creator-workflow:mvp:check`
2. `npm run qa`
3. `npm run verify:ci-parity`

Required workflow:
Project Brief → Query Plan Preview → Discovery Results → Review Actions → Saved Board Sections → Evidence Pack Export Preview.

Required demo scenario:
"Premium documentary thumbnail research: Ancient Carthage and Mediterranean power."

Required board sections:
- Primary Visual References
- Historical / Source Evidence
- Style / Mood References
- Rejected / Weak References
- Export Candidates

Non-goals:
- No new release archive gates.
- No OAuth.
- No paid API requirement.
- No live scraping.

