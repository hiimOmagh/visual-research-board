# Warning Suppression — v2.4.0

v2.4.0 narrows warning suppression to stale artifact warnings.

## warning suppression

The release verifier sets:

```text
VRB_SUPPRESS_STALE_REPORT_WARNINGS=1
```

This suppresses repeated stale artifact warnings from older report files while the verifier is actively regenerating reports.

## stale artifact warnings

The suppressed warnings are limited to old report-state messages such as:

```text
full QA artifact status is failed
report status is failed
failed_gate_count
Run npm run qa to regenerate it
Run npm run verify:release to regenerate it
```

## release verifier

The release verifier must still run every gate.

The release verifier must still fail on real command failures.

The release verifier must not recursively call `verify:all`.

The release verifier must not recursively call `verify:ci-parity`.

## Safety rule

This must not suppress failing gates.

This must not hide errors.

This must not turn failed commands into passed commands.
