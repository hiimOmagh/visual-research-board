# CI Parity Workflow Badge — v2.3.0

v2.3.0 adds a dedicated CI parity workflow and README badge.

## CI parity workflow badge

The badge points to:

```text
.github/workflows/ci-parity.yml
```

The workflow runs:

```bash
npm run verify:ci-parity
```

`npm run verify:ci-parity` is the clean install parity command.

`npm run verify:all` is the normal local single command.

The badge must use `badge.svg` from the `ci-parity.yml` workflow.
