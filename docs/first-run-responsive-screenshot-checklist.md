# First-Run Responsive Screenshot Checklist — v2.2.0

## Required screenshots

### desktop-first-run

Target path:

```text
artifacts/first-run-screenshots/desktop-first-run.png
```

Checks:

- first-run panel visible
- primary search action visible
- provider/source controls reachable
- no horizontal overflow
- boundary copy visible or discoverable

### tablet-first-run

Target path:

```text
artifacts/first-run-screenshots/tablet-first-run.png
```

Checks:

- first-run panel readable
- workflow steps remain understandable
- activation pack copy visible or reachable
- no card overlap
- no clipped text

### mobile-first-run

Target path:

```text
artifacts/first-run-screenshots/mobile-first-run.png
```

Checks:

- first-run panel visible
- primary search action not hidden by panel
- cards stack vertically
- no horizontal overflow
- no clipped text

## Additional states

Capture or inspect:

- empty-state
- first useful search
- first saved reference
- activation pack
- export preview

## review outcome

Record:

- desktop: pass/fail
- tablet: pass/fail
- mobile: pass/fail
- first-run panel visible: pass/fail
- primary search action visible: pass/fail
- activation pack clarity: pass/fail
- export preview clarity: pass/fail
- blocking issues
