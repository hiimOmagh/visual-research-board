# v0.3.2 — Board Sections + Source Organization Upgrade

This release formalizes the saved-board layer into a source organization workflow instead of a simple saved-results list.

## Added

- Default board taxonomy:
  - Inbox
  - Background / context
  - Primary evidence
  - Counter-evidence
  - Visual references
  - Public-domain / open-license candidates
  - Check-required
  - Rejected / do not use
- Editable item tags using normalized comma-separated tags and quick tag chips.
- Board organization audit with section coverage, tag coverage, note coverage, check-required count, reference-only count, rejected count, and warnings.
- Export visibility for section name, section kind, tags, notes, and board organization audit.
- Migration support for older boards and the previous `section_thumbnail` bucket.

## Validation

Run:

```bash
npm run board:organization:check
npm run qa
```

## Scope guard

This version does not implement claim mapping. It only upgrades source organization inside the saved board so v0.3.3 can attach organized sources to claims cleanly.
