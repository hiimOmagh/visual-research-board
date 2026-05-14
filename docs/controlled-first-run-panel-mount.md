
# Controlled First-Run Panel Mount + UI Consistency — v2.1.5

v2.1.5 mounts the first-run workflow panel in `SearchPanel` using a controlled mount path.

## Objective

Make the first-run workflow visible in the actual UI, not only available as a component or documentation.

## controlled mount

The mount must satisfy:

- `SearchPanel` imports `FirstRunWorkflowPanel`
- the import is outside any multiline import section
- `SearchPanel` renders `<FirstRunWorkflowPanel />`
- the mount includes the marker `v2.1.5 controlled first-run panel mount`
- the panel remains early enough to explain the workflow before deeper controls
- no regex-blind JSX corruption

## UI consistency

The panel should be readable on desktop, tablet-width layouts, and mobile-width layouts.

## responsive visibility

The first-run panel uses existing responsive classes and should stay visible without overflow.

## Non-goals

- no provider expansion
- no export rewrite
- no dependency churn
- no scraping
- no image generation
- no paywall bypass
- no source media rehosting
