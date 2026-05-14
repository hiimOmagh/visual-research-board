
# Activation Pack Export Integration Boundaries — v2.1.1

## allowed

- Exporting activation pack metadata as Markdown
- Exporting activation pack metadata as JSON
- Using existing text download utilities
- Preserving source URLs
- Including source roles, risk/access notes, and constraints
- Keeping output as metadata and brief text

## forbidden

- Export system rewrite
- Broad export expansion
- Scraping
- Image generation
- Copyrighted text extraction
- Paywall bypass
- Access circumvention
- Source media rehosting
- Claiming legal permission certainty
- Treating references as owned assets

## existing text download utilities

This milestone should connect to existing client-side text download helpers only. It must not introduce a new export subsystem.

## metadata

Metadata may include title, source URL, source role, access status, rights status, risk level, and brief notes.

## rights/access review

Exported text still requires rights/access review before publication, reuse, generation workflows, or production use.
