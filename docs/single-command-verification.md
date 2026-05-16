# Single-Command Verification UX — v2.3.0

v2.3.0 formalizes the compressed local verification model.

## Primary command

Use this for normal local verification:

```bash
npm run verify:all
```

This runs:

```text
verify:artifacts -> verify:release
```

## Clean install parity

Use this for a clean local run that mirrors CI setup:

```bash
npm run verify:ci-parity
```

This runs:

```text
npm ci -> verify:all
```

## Artifact generation

Use this only when regenerating evidence artifacts without running the full release verifier:

```bash
npm run verify:artifacts
```

This runs:

```text
first-run:visual:evidence -> first-run:evidence-review -> first-run:demo-script
```

## debug-only commands

Only run these when the compressed command fails:

```bash
npm run qa
npm run typecheck
npm run lint
npm run build
npm run release:verify:runner:check
npm run first-run:demo-script:check
npm run first-run:evidence-review:check
npm run first-run:visual:check
```

## Rule

The default verification path is a single command.

```bash
npm run verify:all
```

Use `verify:ci-parity` only when dependency installation itself must be checked.

## v2.3.0 exact verification phrases

The compressed verification model explicitly includes artifact generation before release verification.

- artifact generation is handled by `npm run verify:artifacts`
- release verification is handled by `npm run verify:release`
