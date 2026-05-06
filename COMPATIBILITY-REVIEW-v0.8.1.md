# Compatibility Review — v0.8.1 Release Warning Cleanup

## Preserved

- v0.8.x Public Demo Release Candidate behavior
- v0.7.1 Security and Key Handling checks
- Full QA Gate behavior
- Provider runtime logic
- Export behavior
- Manual/private workflow

## Changed

- Package version and lockfile version to `0.8.1`
- Package description now includes all required release phrases:
  - Release Warning Cleanup
  - Public Demo Release Candidate
  - Security and Key Handling
- Known unused import/variable lint warnings are removed.
- CI action majors are upgraded to Node 24-capable versions.

## Risk

The only moderate risk is workflow action major upgrade behavior. The patch uses official Node 24-capable majors and keeps the workflow structure unchanged.
