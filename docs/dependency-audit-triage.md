
# Dependency Audit Triage — v2.0.2

v2.0.2 is a dependency-audit triage patch.

## Objective

Review the 2 moderate npm audit warnings without force-fixing or introducing dependency churn.

## Scope

- run `npm audit`
- identify the 2 moderate npm audit warnings
- separate direct vs transitive dependency risk
- document runtime vs dev-only exposure
- identify patched version ranges
- propose a non-breaking update path
- decide whether action belongs in a separate dependency-maintenance milestone

## Policy

No `npm audit fix --force`.

Reason: force-fixing can introduce breaking dependency changes, mutate unrelated transitive packages, and destabilize the v2 stable workflow.

## Required triage fields

For each warning, record:

- package name
- severity
- advisory or vulnerability ID
- direct dependency or transitive dependency
- dependency path
- affected version
- patched version
- production runtime exposure
- development tooling exposure
- exploitability note
- breaking change risk
- proposed non-breaking update path
- decision

## Decision classes

- monitor only
- non-breaking update available
- dependency-maintenance milestone required
- false positive or not applicable
- requires immediate patch

## Non-goals

- no dependency churn
- no feature changes
- no force fix
- no provider expansion
- no export rewrite
- no scraping
- no image generation
- no copyrighted text extraction
- no paywall bypass
- no source media rehosting

## Output requirement

This patch documents the triage workflow. It does not claim the warnings are fixed unless a future dependency-maintenance milestone updates dependencies safely.


## v2.0.2 observed audit result

`npm audit` reports 2 moderate warnings from one dependency path:

- vulnerable package: `postcss <8.5.10`
- advisory: GHSA-qx2v-qp2m-jg93
- parent dependency: `next`
- dependency path: `next -> postcss`
- npm force-fix proposal: install `next@9.3.3`
- decision: reject force-fix for this release because it is a breaking downgrade path
- status: triaged, not fixed
- follow-up: dependency-maintenance milestone only, after compatibility review
