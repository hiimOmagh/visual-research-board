# Release Evidence Index — v2.3.0

v2.3.0 adds a generated release evidence index.

## release evidence index

Generated file:

```text
artifacts/release-evidence-index.json
```

Generate it with:

```bash
npm run release:evidence:index
```

Check it with:

```bash
npm run release:evidence:index:check
```

## artifact inventory

The index records a verification artifact inventory:

```text
artifacts/full-qa-gate-report.json
artifacts/release-verify-report.json
artifacts/first-run-visual-evidence.json
artifacts/first-run-evidence-review.json
artifacts/first-run-demo-script.json
```

## verification artifacts

Each indexed file records:

```text
path
exists
size_bytes
sha256
json_status
status
app_version
```

## Boundary

The index proves artifact presence and integrity hashes.

It does not prove rights clearance.

It does not rehost source media.

It does not enable scraping, paywall bypass, or image generation.
