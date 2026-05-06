# v1.9.0 — Museum/Open-Access Provider Pack

v1.9.0 expands the free-source visual retrieval layer with museum, cultural heritage, natural-history, public-record, and digital-library providers.

## Provider classes

No-key providers enabled by default:

- Met Museum (`met`)
- Art Institute of Chicago (`artic`)
- Cleveland Museum of Art (`cleveland_museum`)
- Wellcome Collection (`wellcome`)
- Biodiversity Heritage Library (`bhl`)
- Gallica / BnF (`gallica`)
- National Archives / NARA (`nara`)

Free-key providers disabled by default:

- Rijksmuseum (`RIJKSMUSEUM_API_KEY`)
- NYPL Digital Collections (`NYPL_API_KEY`)
- DPLA (`DPLA_API_KEY`)

Existing free/open providers remain available: Wikimedia Commons, Openverse, Library of Congress, Internet Archive, NASA Images, Smithsonian, and Europeana.

## Routing behavior

The query planner routes museum/open-access providers through the `museum`, `archive`, `open_media`, `science`, and `academic_context` source classes. Historical, public-domain, documentary, and academic modes receive the strongest museum routing.

## Rights behavior

Museum/open-access results are still marked with rights and reuse-risk labels. Public-domain signals are surfaced when provider metadata supports them. Otherwise, the app marks candidates as `check_required` instead of assuming publication clearance.

## Validation

Run:

```bash
npm run museum:providers:check
npm run qa
```

The validation gate checks provider registration, toggles, routing, runtime readiness, search route integration, provider implementation files, and current app/version labels.
