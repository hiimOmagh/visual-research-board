
# Audit Warning Review — v2.0.1

## Current signal

`npm ci` reports 2 moderate npm audit warnings.

## Decision

Review the warnings without force-fixing.

This patch does not run `npm audit fix --force`.

## Why

`npm audit fix --force` can upgrade or replace dependency paths in ways that introduce breaking changes. That belongs in a separate dependency-maintenance milestone, not in a stable hygiene patch.

## Required triage

- run `npm audit`
- identify vulnerable package names
- identify whether the vulnerable packages are direct or transitive dependencies
- identify patched version ranges
- identify whether a non-breaking update path exists
- document whether the issue affects production runtime or only development tooling
- triage separately before changing package versions

## Prohibited behavior

- do not change package versions blindly
- do not run force-fixes during the stable hygiene patch
- do not mix dependency-maintenance work with release-hygiene work

## Follow-up milestone

Use a dedicated dependency-maintenance milestone if action is required.
