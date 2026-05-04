# v0.3.2 — Board Sections + Source Organization Upgrade

## Summary

Upgrades the saved board from a simple saved-results list into a structured source organization layer with default research sections, editable tags, organization diagnostics, and section-aware exports.

## Main changes

- Added `src/lib/board-organization.ts`.
- Added board organization types:
  - `BoardSectionKind`
  - `BoardOrganizationAudit`
- Expanded default board sections:
  - Inbox
  - Background / context
  - Primary evidence
  - Counter-evidence
  - Visual references
  - Public-domain / open-license candidates
  - Check-required
  - Rejected / do not use
- Added normalized tag editing in saved item cards.
- Added quick tag chips for common research tags such as map, archive, document, public-domain, check-rights, counter-evidence, and thumbnail.
- Added board organization audit counts and warnings in the saved board.
- Added migration support for the old `section_thumbnail` bucket into `section_visual_reference`.
- Updated exports to include board organization audit, section name, section kind, tag counts, note counts, and project-library organization counts.
- Updated library export filename to `visual-research-board-library-v0.3.2.json`.
- Updated app version to `0.3.2`.
- Added validation script: `npm run board:organization:check`.

## Validation

Passed:

```bash
npm run board:organization:check
npm run qa
```

Not completed successfully in this container:

```bash
npm run typecheck
npm run lint
```

Reason: `node_modules` is absent in this container, so TypeScript/ESLint fail on missing Next/React/Node/Tailwind/ESLint dependencies before source-level validation can complete.

## Next recommended build

`v0.3.3 — Claim-to-Source Mapping`
