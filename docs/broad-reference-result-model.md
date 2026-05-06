# Broad Reference Result Model — v1.7.0

v1.7.0 makes broad reference source classes first-class without adding new providers or changing retrieval behavior.

## Purpose

Search results should become structured reference objects. The model supports the next product direction: broad web/image/social/book/archive discovery with source context preserved.

## Product rule

Discovery first. Classification second. Risk/access/licensing labels third. User judgment fourth. Creative or research activation last.

The model does not block discovery. It adds classification and review context.

## Source classes

- `web_image`
- `web_page`
- `social_media`
- `book`
- `archive`
- `museum`
- `stock`
- `video`
- `unknown`

## Core fields

- `id`
- `query`
- `title`
- `description`
- `image_url`
- `source_url`
- `display_url`
- `source_class`
- `platform`
- `creator_or_author`
- `publisher`
- `date`
- `access_status`
- `rights_status`
- `risk_level`
- `relevance_score`
- `evidence_notes`
- `reference_intelligence`

## Non-goals

- No provider changes
- No retrieval logic changes
- No social search implementation yet
- No book search implementation yet
- No generation engine
- No export behavior changes yet
