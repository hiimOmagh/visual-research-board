# v2.2.0 — End-to-End Creator Research Workflow MVP

Objective: shift Visual Research Board from release-hardened infrastructure into a usable product workflow.

Core loop:

```text
Project Brief → Query Plan Preview → Discovery Results → Review Actions → Saved Board Sections → Evidence Pack Export Preview
```

Implemented as a local-first workflow with transparent fixture/demo mode when real providers are unavailable.

## User-facing workflow

- Research Brief panel: topic, use case, visual style, platform/output type, source priority, risk tolerance, notes.
- Smart Query Plan Preview: primary query, expanded queries, source classes, reason for routing, expected result types.
- Discovery Results: review actions for save, reject, strong reference, weak/uncertain, notes, attribution copy, source open.
- Saved Board Sections: Primary Visual References, Historical / Source Evidence, Style / Mood References, Rejected / Weak References, Export Candidates.
- Evidence Pack Export Preview v2: project brief, references, source URLs, attribution text, usage/rights notes, review notes, missing coverage, query plan, timestamp.

## Demo scenario

Premium documentary thumbnail research: Ancient Carthage and Mediterranean power.

## Validation

```bash
npm run creator-workflow:mvp:check
npm run qa
npm run verify:ci-parity
```

## Non-goals

- No packaging expansion.
- No release archive gate.
- No OAuth.
- No paid API dependency.
- No fake live-provider claims.
