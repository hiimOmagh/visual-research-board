
# Release Verification Runner Checklist — v2.1.1

## local validation

Run:

```bash
npm ci
npm run verify:release
```

Alternative clean parity path:

```bash
npm run verify:ci-parity
```

## expected artifact

The runner writes:

- artifacts/release-verify-report.json

Expected fields:

- app_version
- status
- failed_command
- command_count
- passed_command_count
- failed_command_count
- planned_scripts
- commands

## GitHub Actions

CI should include:

```bash
npm ci
npm run verify:release
```

## review outcome

Record:

- local verify: pending/pass/fail
- CI verify: pending/pass/fail
- first failed command, if any
- whether `artifacts/release-verify-report.json` is current
- whether full QA also passed
- whether tag can be created
