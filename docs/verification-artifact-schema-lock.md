# Verification Artifact Schema Lock — v2.4.0

v2.4.0 adds the verification artifact schema lock.

## verification artifact schema lock

The schema lock protects the shape of the two main verification artifacts:

```text
artifacts/full-qa-gate-report.json
artifacts/release-verify-report.json
```

## Required full QA report fields

The full QA artifact must preserve:

```text
app_version
status
failed_gate_count
gate results
```

Accepted status values:

```text
passed
failed
```

## Required release verification report fields

The release verification artifact must preserve:

```text
app_version or appVersion or version
status
release command results
```

Accepted status values:

```text
passed
failed
```

## Why this exists

The artifact schema lock prevents silent breakage where reports still exist but no longer carry enough evidence for release review.

It validates structure. It is not a rights-clearance statement and does not certify external source permissions.
