# v0.8.2 CI Hotfix — Version Alignment

## Diagnosis

The failed CI artifact shows `npm run qa` stopped at the first Full QA gate:

```text
category: baseline
name: core-static-qa
command: node tests/qa-check.mjs
status: failed
```

The v0.8.2 patch bumped `package.json` and the Full QA gate to `0.8.2`, but retained older v0.8.2 hard-coded assertions in cumulative static checks such as `tests/qa-check.mjs`. Those checks still expected `package.json` and the SearchPanel header/export filenames to contain `0.8.2`.

## What this hotfix does

- Aligns stale `0.8.2` / `v0.8.2` literals to `0.8.2` / `v0.8.2` across source, tests, docs, workflow files, and package files.
- Preserves `security:key:check` and `qa:security`.
- Ensures `public-demo:check`, `qa:public-demo`, and `clean:rc` exist.
- Ensures the Full QA gate includes the public-demo release-candidate gate.
- Verifies that `tests/qa-check.mjs` no longer expects `0.8.2`.

## Apply

Copy `apply-v0.8.2-ci-hotfix.mjs` to the repository root, then run:

```bash
node apply-v0.8.2-ci-hotfix.mjs
```

## Validate

```bash
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## Commit

```bash
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md .env.example .github/workflows/ci.yml docs scripts src tests
git commit -m "fix: align v0.8.2 release candidate QA expectations"
```

## Scope boundary

This is not a feature patch. It only fixes release-version alignment and CI gate consistency after v0.8.2.
