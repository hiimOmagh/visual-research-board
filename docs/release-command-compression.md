# Release Command Compression — v2.1.7

v2.1.7 compresses release validation into a small command surface.

## release command compression

The command hierarchy is:

```text
verify:ci-parity
└─ npm ci
└─ verify:all
   └─ verify:artifacts
   │  ├─ first-run:visual:evidence
   │  ├─ first-run:evidence-review
   │  └─ first-run:demo-script
   └─ verify:release
      ├─ release checks
      ├─ full QA
      ├─ typecheck
      ├─ lint
      └─ build
```

## Commands

### verify:artifacts

Generates evidence artifacts that the release verifier expects.

### verify:all

Generates artifacts and runs the full release verifier.

### verify:ci-parity

Performs clean dependency installation and then runs `verify:all`.

## Anti-recursion rule

`verify:release` must not recursively call `verify:all`.

`verify:release` must not recursively call `verify:ci-parity`.

The release verifier may call individual checks, `qa`, `typecheck`, `lint`, and `build`.

## failure isolation

When `verify:all` fails:

1. Read the first failed command in the log.
2. Run only that command.
3. Fix the smallest failing condition.
4. Run `npm run verify:all` again.

Do not return to the old long manual checklist unless debugging a specific failing command.

## v2.1.7 exact anti-recursion phrases

The release verifier has strict anti-recursion rules:

- must not recursively call verify:all
- must not recursively call verify:ci-parity
