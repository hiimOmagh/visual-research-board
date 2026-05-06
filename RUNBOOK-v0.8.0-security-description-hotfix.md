# v0.8.1 Security Description Hotfix

## Cause

`npm run security:key:check` failed because the v0.8.1 package description only identified the Public Demo Release Candidate and no longer included the exact phrase required by the inherited v0.7.1 security check: `Security and Key Handling`.

## Fix

Run from the repository root:

```bash
node apply-v0.8.1-security-description-hotfix.mjs
```

## Validate

```bash
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## Expected status

- `security:key:check`: passed
- `qa`: passed
- `typecheck`: passed
- `lint`: warnings only are acceptable if exit code is 0
- `build`: passed
