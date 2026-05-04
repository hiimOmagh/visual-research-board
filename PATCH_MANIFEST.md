# v0.2.11 — Query Expansion + Source-Class Routing Patch Manifest

## Release objective

Add bounded query expansion and source-class routing so each provider receives query variants matched to its strengths instead of the same generic query slice.

## Core changes

- Added query intent/source-class types and routing diagnostics.
- Rebuilt `createSearchPlan()` to generate query variants with provider targets.
- Added provider-specific routing entries in `search_plan.provider_routing`.
- Added `diagnostics.source_class_routing`.
- Added `providerQuerySlice(plan, provider)` and routed all provider adapters through it.
- Added source-class/routing visibility in Provider Health and a new Source Class Routing panel.
- Added `npm run query:routing:check` and included it in `npm run qa`.
- Updated release metadata to `0.2.11`.

## Validation run

Passed:

```bash
npm run query:routing:check
npm run qa
```

Not completed:

```bash
npm run typecheck
npm run lint
```

Reason: this container has no installed `node_modules`; TypeScript/ESLint fail on missing Next/React/Node/Tailwind/ESLint dependencies. After fixing the one source-level TypeScript issue found in `query-planner.ts`, remaining typecheck output is dependency-resolution noise.

## Changed-file patch

This ZIP contains only files modified or added relative to v0.2.10.
