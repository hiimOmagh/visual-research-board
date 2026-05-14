
# Release Artifact Hygiene — v2.1.1

## Rule

The repository should contain source, tests, docs, and intentional QA artifacts only.

## generated/cache files

Do not commit:

- node_modules
- .next
- out
- dist
- coverage
- playwright-report
- test-results
- tsconfig.tsbuildinfo
- __pycache__
- root apply-v scripts
- local zip bundles
- local tar bundles
- local logs

## allowed artifact

The expected committed release evidence artifact is:

- artifacts/full-qa-gate-report.json

It must correspond to the current app version.

## cleanup commands

```bash
rm -rf node_modules .next out dist coverage playwright-report test-results __pycache__
rm -f apply-v*.mjs apply-v*.py
rm -f *.zip *.tar *.tgz *.log
git restore tsconfig.tsbuildinfo 2>/dev/null || true
```

## final check

```bash
git status --short
npm run stable:hygiene:check
```
