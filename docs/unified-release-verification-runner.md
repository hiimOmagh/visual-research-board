
# Unified Release Verification Runner — v2.1.0

v2.1.0 adds a one-command release verification runner.

## Objective

Replace long manual validation chains with one fail-fast command:

```bash
npm run verify:release
```

For CI parity from a clean install path:

```bash
npm run verify:ci-parity
```

## Behavior

The runner performs preflight checks, verifies `node_modules`, executes release gates, runs full QA, typecheck, lint, build, and repeats the current release package audit at the end.

It writes:

- `artifacts/release-verify-report.json`

## fail-fast

The runner stops at the first failed command and records:

- failed_command
- command_count
- passed_command_count
- failed_command_count
- command durations
- app version

## local/CI parity

GitHub Actions should run:

```bash
npm ci
npm run verify:release
```

Local clean parity can use:

```bash
npm run verify:ci-parity
```

## Non-goals

- no new features
- no dependency churn
- no provider expansion
- no export rewrite
- no scraping
- no image generation
- no copyrighted text extraction
- no paywall bypass
- no source media rehosting
