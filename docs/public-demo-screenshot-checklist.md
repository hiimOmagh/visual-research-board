
# Public Demo Screenshot Checklist — v2.1.0

## screenshot evidence

The public demo should have a screenshot evidence set before tagging v2.1.0.

## required screenshots

Capture these views:

1. landing/default state
2. discovery/board state
3. activation pack workflow
4. export integration panel
5. empty-state behavior
6. desktop-width sanity
7. mobile-width sanity

## file naming

Recommended names:

- `v2.1.0-01-landing-default.png`
- `v2.1.0-02-discovery-board.png`
- `v2.1.0-03-activation-pack-workflow.png`
- `v2.1.0-04-export-integration-panel.png`
- `v2.1.0-05-empty-state.png`
- `v2.1.0-06-desktop-width.png`
- `v2.1.0-07-mobile-width.png`

## review outcome

For each screenshot, record:

- pass/fail
- viewport
- route/state
- visible issue, if any
- whether the screenshot supports the stable workflow
- whether the screenshot avoids unavailable claims
- whether follow-up is needed

## review criteria

- primary actions visible
- layout stable
- no serious overflow
- empty state is understandable
- activation workflow is understandable
- export integration is understandable
- references remain source-aware
- no rights-clearance guarantee
- no scraping implication
- no generation implication
- no paywall-bypass implication

## commit policy

Screenshot files may be stored as release artifacts instead of committed to the repo. If committed, use a deliberate folder and avoid large uncompressed files.
