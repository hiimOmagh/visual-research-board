# v0.3.3 — Claim-to-Source Mapping

## Summary

Upgrades the board from organized source storage into a claim-oriented evidence workspace. Saved sources can now be attached to explicit claims as support, weakening evidence, contradiction, context, or visual-reference-only material.

## Main changes

- Added `src/lib/claim-mapping.ts`.
- Added `src/components/search/ClaimMappingPanel.tsx`.
- Added claim mapping types:
  - `ClaimEvidenceRelation`
  - `ClaimSourceLink`
  - `ResearchClaim`
  - `ClaimMappingAudit`
- Added `claims` to each research project.
- Added claim creation, editing, status/confidence controls, and deletion.
- Added saved-source claim linking in saved board cards.
- Added relation labels:
  - supports
  - weakens
  - contradicts
  - contextual
  - visual_reference_only
- Added claim mapping audit warnings for unlinked saved sources, claims with no support, contested claims, and visual-reference overload.
- Added claim evidence export template.
- Added claim mapping data to JSON, Markdown, CSV, template, and project-library exports.
- Updated source removal so deleted saved items are also unlinked from claims.
- Updated library export filename to `visual-research-board-library-v0.3.3.json`.
- Updated app version to `0.3.3`.
- Added validation script: `npm run claim:mapping:check`.

## Validation

Passed:

```bash
npm run claim:mapping:check
npm run qa
```

Not completed successfully in this container:

```bash
npm run typecheck
npm run lint
```

Reason: `node_modules` is absent in this container, so TypeScript/ESLint fail on missing Next/React/Node/Tailwind/ESLint dependencies before source-level validation can complete.

## Next recommended build

`v0.3.4 — Coverage and Bias Audit`
