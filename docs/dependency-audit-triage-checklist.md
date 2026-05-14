
# Dependency Audit Triage Checklist — v2.0.2

## Run

```bash
npm audit
npm audit --json > artifacts/npm-audit-v2.0.2.json
```

Do not commit local audit JSON unless the release process explicitly wants that evidence artifact.

## For each warning

Record:

- package name
- severity
- advisory ID
- direct dependency
- transitive dependency
- dependency path
- affected version
- patched version
- production runtime exposure
- development tooling exposure
- breaking change risk
- proposed non-breaking update path
- decision

## Exposure classification

### production runtime

The vulnerability may affect deployed application behavior or runtime code paths.

### development tooling

The vulnerability is limited to install/build/test tooling or local developer workflow.

## Decision

Choose one:

- monitor only
- non-breaking update available
- dependency-maintenance milestone required
- false positive or not applicable
- requires immediate patch

## Non-breaking update rule

Prefer:

- patch/minor update inside existing semver range
- direct dependency bump only if compatible
- lockfile refresh only after validation
- full QA after any dependency change

## Prohibited

- `npm audit fix --force`
- blind package version changes
- mixing feature changes with dependency triage
- changing providers or export behavior in this patch


## Current audit finding

From `npm audit` on v2.0.2:

- package name: `postcss`
- severity: moderate
- advisory: GHSA-qx2v-qp2m-jg93
- issue: PostCSS has XSS via unescaped `</style>` in CSS stringify output
- dependency path: `next -> postcss`
- direct dependency: `next`
- transitive dependency: `postcss`
- affected range: `postcss <8.5.10`
- current location: `node_modules/next/node_modules/postcss`
- npm proposed fix: `npm audit fix --force`
- force-fix result: would install `next@9.3.3`
- breaking change risk: high / unacceptable for this stable patch
- production runtime exposure: requires review; likely tied to CSS stringification path
- development tooling exposure: yes, through framework/build dependency path
- decision: do not force-fix in v2.0.2
- proposed non-breaking update path: wait for compatible Next/PostCSS resolution or handle in a dedicated dependency-maintenance milestone
