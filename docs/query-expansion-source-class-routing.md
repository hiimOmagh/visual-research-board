# v0.3.1 — Query Expansion + Source-Class Routing

v0.3.1 changes the search planner from a single shared query list into a routed query pack. The app now creates bounded query variants and routes them to providers by source class.

## Why this matters

Before this release, every provider received the same front-sliced query list. That wasted free provider calls because archive providers, open-media providers, science providers, and manual reference launchers need different wording.

v0.3.1 separates:

- open-media queries for Wikimedia/Openverse
- archive queries for LOC/Internet Archive/Europeana
- museum/cultural queries for Smithsonian/Europeana
- science/public-agency queries for NASA/Smithsonian
- web/news/context queries for optional web providers
- manual-reference queries for the Reference Search Hub

## Added objects

- `QueryIntent`
- `SourceClass`
- `QueryVariant`
- `ProviderRoutingPlanEntry`
- `SourceClassRoutingTrace`
- `search_plan.query_variants`
- `search_plan.provider_routing`
- `diagnostics.source_class_routing`

## Routing rule

Providers no longer blindly consume `plan.queries`. Provider adapters use `providerQuerySlice(plan, provider)` so each provider receives the query variants matched to its source class.

## Guardrails

- Query fan-out is capped by depth.
- Provider query counts are capped separately.
- Search engines remain manual reference launchers only.
- Routing diagnostics expose source-class coverage and provider query counts.

## Validation

Run:

```bash
npm run query:routing:check
npm run qa
```
