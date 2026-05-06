# v1.3.0 — Local Storage + Import/Export Hardening

This release hardens the local project-library workflow before the app moves into broader provider expansion and public-demo readiness.

## Scope

v1.3.0 adds a storage validation layer around browser-local project libraries.

The app now supports:

- schema-aware import validation before merge
- backup envelopes with integrity counts and checksum metadata
- corrupted/unreadable JSON rejection with explicit warnings
- migration-required reports for missing or mismatched schema versions
- partial-import reporting when only some projects are usable
- safer restore semantics for backup-envelope imports
- import validation summaries visible in the UI

## Backup envelope

A backup export uses this shape:

```json
{
  "kind": "visual_research_board_library_backup",
  "schema_version": "1.3.0",
  "app_version": "1.3.0",
  "library_schema_version": "0.1.0",
  "integrity": {
    "project_count": 1,
    "saved_result_count": 0,
    "claim_count": 0,
    "search_history_count": 0,
    "result_snapshot_count": 0,
    "section_count": 8,
    "fingerprint": "fnv1a32:..."
  },
  "checksum": "fnv1a32:...",
  "library": {}
}
```

The checksum is a lightweight client-side integrity signal, not a cryptographic security guarantee.

## Import validation states

- `valid`: accepted without migration warnings
- `needs_migration`: accepted but normalized before merge
- `partial`: some entries were accepted and some rejected
- `rejected`: no usable project library could be found

## Non-goals

v1.3.0 does not add cloud sync, authentication, server persistence, encryption, or collaborative editing.

## Validation

Run:

```bash
npm run storage:hardening:check
npm run qa
```
