# v0.3.3 — Claim-to-Source Mapping

This release turns the saved board from a source collection into a claim-oriented evidence workspace.

## Scope

- Adds claim cards to each project.
- Links saved sources to claims.
- Classifies each link as support, weakening evidence, contradiction, context, or visual-reference-only material.
- Tracks claim status and confidence.
- Preserves claim links in project/library exports.
- Adds claim evidence exports and CSV claim-link columns.
- Removes saved-source links from claims when a source is deleted.

## Evidence relation labels

- `supports`
- `weakens`
- `contradicts`
- `contextual`
- `visual_reference_only`

## Claim status labels

- `under_supported`
- `supported`
- `contested`
- `needs_verification`

## Quality gate

Run:

```bash
npm run claim:mapping:check
npm run qa
```

The dedicated check verifies the claim data model, project migration path, UI panels, source-link controls, export inclusion, and package metadata.
