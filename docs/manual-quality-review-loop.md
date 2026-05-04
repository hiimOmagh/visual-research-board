# Manual Quality Review Loop — v0.2.11

`v0.2.11` adds a manual quality review loop for saved references.

## Purpose

The app can retrieve, score, and rank visual candidates, but final editorial curation still needs human judgment. Manual review labels separate machine-generated ranking from creator/editor decisions.

## Review dimensions

Each saved item can be reviewed across four dimensions:

- relevance
- visual usefulness
- source trust
- license status

Each dimension supports `Unreviewed`, `Pass`, `Watch`, and `Fail`.

## Final verdicts

Each saved item can receive one final verdict:

```text
Unreviewed
Approved reference
Use with caution
Needs source check
Reject
```

## Quality Review export

The saved board now includes a `Quality Review` export. It creates a markdown evidence report containing item-level verdicts, review labels, reviewer notes, source URLs, provider/source group, and risk/license candidate labels.

## Important limitation

Manual review is an editorial quality-control layer. It is not legal clearance. License and risk labels remain candidates and must be verified from the original source before publication or commercial use.
