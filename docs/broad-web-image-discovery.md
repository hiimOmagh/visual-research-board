# Broad Web + Image Discovery Expansion — v2.0.0

v2.0.0 adds the controlled broad web/image discovery planning layer.

## Purpose

This milestone prepares the app to discover broadly across web and image-heavy results while mapping candidates into the Broad Reference Result Model.

## Product rule

Discovery first. Classification second. Risk/access/licensing labels third. User judgment fourth. Creative or research activation last.

## Added capability

- Broad discovery mode planning
- Web discovery mode planning
- Image discovery mode planning
- Visual reference discovery mode planning
- Safe/open discovery mode planning
- Candidate normalization into `BroadReferenceResult`
- Mode-based filtering helpers
- Discovery mode UI panel

## Non-goals

- No provider changes
- No retrieval logic changes
- No scraping
- No dedicated social search yet
- No dedicated book search yet
- No generation engine
- No export behavior changes

## Boundary

The layer plans and normalizes broad discovery. It does not claim live scraping, production provider coverage, legal clearance, or guaranteed source certainty.
