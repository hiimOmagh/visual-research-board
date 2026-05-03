# Browser QA Checklist — v0.1.0

This checklist is the manual companion to the automated `npm run qa` /
`npm run typecheck` / `npm run lint` pipeline. The automated checks confirm
shape, schema, and structural invariants, but they cannot exercise the
browser-driven workflow. Run through this checklist before publishing the stable build. The checklist covers provider setup states, mock-only safe mode, source grouping, quality explanations, result sorting, static demo behavior, and runtime deployment behavior.

## Setup

1. `npm install`
2. `npm run qa` — must exit 0.
3. `npm run typecheck` — must exit 0.
4. `npm run lint` — must exit 0.
5. `npm run dev` — start the local server.
6. Open the dev URL in a fresh browser profile (no extension noise).

## Core workflow

- [ ] **Create project** — Use "New project" in the project library panel.
      Active project switches to the new one.
- [ ] **Search a mock topic** — Default topic "Hannibal crossing the Alps"
      with mode = `youtube_documentary`, depth = `standard`. Results
      appear, grouped by source class.
- [ ] **Toggle providers** — Disable Brave + Tavily, run the search again.
      Provider health panel shows them as `skipped`. Mock + Wikimedia stay
      `active` or `no_results` depending on environment.
- [ ] **Save a result** — Click "Save" on a result card. The card flips to
      "Saved" and the saved board on the right increments.
- [ ] **Edit a saved note** — In the saved board, type into the Notes
      textarea. The note persists after a page refresh.
- [ ] **Assign a section** — Use the Section dropdown on a saved item.
      Selecting another section moves it.
- [ ] **Add a custom section** — Type a name in "Add section" and click Add.
      The new section appears in the dropdown.
- [ ] **Manual URL import** — Paste any `https://…` URL in the manual
      import form and click "Add manual source". The item appears in the
      saved board. Optionally use "Fetch metadata" first.

## Result quality — stable

- [ ] **Source grouping** — Result grid sections are grouped by source class such as Commons/open-access, institutional archive, news/media, or general web.
- [ ] **Why this result** — Each result card shows a compact explanation. Inspecting a result shows the full reason list.
- [ ] **Sort controls** — Change Sort by to relevance, source credibility, visual quality, and newest. Ordering changes without losing filters.
- [ ] **Saved-first sorting** — Save one visible result, keep "Saved items first" enabled, and confirm saved results remain at the top of the filtered view.
- [ ] **Deduplication sanity** — Repeated source/image URLs should not appear as multiple equivalent cards after a search.
- [ ] **Export quality context** — JSON/Markdown/CSV/template exports include source-group and why-this-result context where applicable.

## Export preview drawer

- [ ] **Preview JSON** — Click "Preview JSON" in the saved board. Drawer
      opens, shows JSON content, line/character counts.
- [ ] **Preview Markdown** — Same, for Markdown.
- [ ] **Preview template** — Pick "Production Brief" from the template
      selector, click "Preview template". Drawer shows the brief.
- [ ] **Copy to clipboard** — Click "Copy to clipboard". Button shows
      "Copied" briefly. Verify by pasting into another app.
- [ ] **Download from preview** — Click Download. File downloads, contents
      match the preview text.
- [ ] **Empty preview** — Clear the saved board (Clear button), then try
      preview again. The drawer shows "The current export would be empty".
      No download is offered.
- [ ] **Escape closes drawer** — Open any preview, press `Esc`. Drawer
      closes, focus returns to the page.

## Direct exports (no preview)

- [ ] **Download JSON** — File contains an `export_schema_version` of
      `0.1.0` and an `audit` block.
- [ ] **Download Markdown** — Markdown opens in a Markdown viewer.
- [ ] **Download CSV** — CSV opens in a spreadsheet with one row per saved
      result.
- [ ] **Attribution Pack** — Markdown export with one attribution line per
      saved result.

## Project library import / export

- [ ] **Export library** — Saves a JSON file `visual-research-board-library-v0.1.0.json`.
      Open it in a text editor, confirm `schema_version` is `0.1.0`
      and the audit block lists all your projects.
- [ ] **Re-import the same file** — Click "Import library", choose the file
      you just exported. The import summary panel appears showing
      "Imported N projects, renamed N, remapped N duplicate ids" — every
      project is renamed and remapped because it collides with itself.
- [ ] **Active project preserved** — After the import above, the active
      project in the dropdown is **still** the one you had selected before
      the import. None of your work was overwritten.
- [ ] **Conflict summary fields** — The summary lists imported, renamed,
      remapped, rejected counts and total projects after import.
- [ ] **Reject invalid file** — Try importing a non-JSON file (e.g. an
      image). An error appears, no projects are added.
- [ ] **Reject empty library** — Try importing an empty `{}` file. The
      summary reports 0 imported, status = `rejected`, library unchanged.

## Search history + snapshots

- [ ] **Search history populates** — Each search adds an entry. Provider
      health summary is visible per entry.
- [ ] **Restore snapshot** — Click "Restore snapshot" on an entry. The
      results grid, search plan, diagnostics, and provider toggles all
      revert to the snapshot's state.
- [ ] **Delete and duplicate project** — Use "Duplicate active" then
      "Delete active" on the duplicate. Active project rolls back to the
      most recently updated remaining project.

## Persistence

- [ ] **Refresh the page** — All state is recreated: active project,
      saved items, sections, search history, snapshots.
- [ ] **localStorage migration** — In dev tools, locate the key
      `visual-research-board:project-library:v0.1.0`. There must
      be no orphaned alpha.5 / alpha.6 keys after a successful migration
      (those keys are cleaned up only when present at startup).

## Accessibility

- [ ] **Tab order** — Press Tab repeatedly from page load. Every
      interactive element receives a visible focus ring (lime).
- [ ] **Form labels** — Inputs in the manual import form, search form, and
      project library panel are labeled (visible label or `aria-label`).
- [ ] **Buttons have names** — Every button reads as descriptive text in
      a screen reader (no buttons that read as just an icon name).
- [ ] **Empty states** — All empty states (no results, no history, no
      saved items) are visible regions with descriptive titles, not blank
      areas. They suggest a next step.
- [ ] **Risk labels** — Each risk badge shows text ("Low", "High", etc),
      not just a colored dot. Color is supplementary.
- [ ] **Drawer dialog** — Export preview drawer has `role="dialog"`,
      `aria-modal="true"`, and an accessible title. Escape closes it.
- [ ] **Status announcements** — Library import summary uses
      `role="status"` so a screen reader announces it without stealing
      focus.
- [ ] **No keyboard traps** — Inside the export preview drawer, Tab
      cycles through actionable controls and eventually lets you reach
      Close.

## Provider validation — stable

- [ ] **No keys** — With no `.env.local`, run a search. Mock returns results. Brave/Tavily show `missing_key` when enabled and targeted.
- [ ] **Mock-only UI toggle** — Click "Mock-only safe mode" in the provider toggle panel. Only Mock remains on in the browser state.
- [ ] **Server mock-only env** — Start dev with `VISUAL_RESEARCH_BOARD_MOCK_ONLY=true npm run dev`. Search diagnostics show mock-only mode and non-mock providers are skipped server-side.
- [ ] **Invalid key behavior** — With an intentionally invalid key, the provider card shows `error`; mock results and the page remain usable.
- [ ] **Provider counts** — Provider health shows total result count and typed result counts such as `image` / `web`.

## Risk / license safety

- [ ] **Amber warning visible** — The header has the "License and risk
      labels are candidates only" amber notice.
- [ ] **No false "safe" claims** — No UI element marks an image as
      "commercially safe". Labels stay candidate-style ("public-domain
      candidate", "license-check-needed", etc).

## Sign-off

If every box above is ticked and `npm run test:ci:no-browser` passes,
the build is ready to package as
`visual-research-board-v0.1.0.zip`.
