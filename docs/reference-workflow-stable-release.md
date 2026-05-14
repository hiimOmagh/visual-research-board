# Reference Workflow Stable Release — v2.1.0

v2.1.0 is the stable release for the complete reference workflow.

## Stable workflow

The stable workflow is:

discovery → board → activation → export

## Consolidated capabilities

- broad web/image discovery planning
- social reference discovery classification
- book/bibliographic discovery classification
- broad reference result normalization
- reference intelligence metadata
- board/workflow organization
- activation pack creation
- activation pack UI workflow
- activation pack Markdown/JSON preview
- activation pack Markdown/JSON metadata/brief-text export using existing download utilities
- full QA gate coverage
- public demo release evidence

## Stable-release rule

No new feature expansion.

This release must stabilize what already exists instead of adding new providers, scraping, generation, or export rewrites.

## Non-goals

- No new feature expansion
- No scraping
- No image generation
- No copyrighted text extraction
- No paywall bypass
- No access circumvention
- No provider expansion
- No export rewrite
- No source media rehosting

## Acceptance criteria

- full QA passes with zero failed gates
- npm ci passes
- typecheck passes
- lint passes
- build passes
- public demo checks pass
- security/key checks pass
- activation export integration checks pass
- stable workflow release check passes
- release docs and screenshot checklist are present
