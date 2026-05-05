import type { ClaimSourceLink, ResearchClaim, ResearchProject, ResearchResult } from "@/types/research";
import { assignDefaultSection, createEmptyProject } from "@/lib/project";
import { normalizeBoardTags } from "@/lib/board-organization";
import { normalizeManualReview } from "@/lib/manual-quality-review";

function iso(): string {
  return new Date().toISOString();
}

function demoResult(overrides: Partial<ResearchResult> & Pick<ResearchResult, "id" | "title" | "source_url" | "source_domain" | "provider">): ResearchResult {
  const now = iso();
  return assignDefaultSection({
    type: "image",
    description: "Demo fixture item for the public workflow sample.",
    thumbnail_url: undefined,
    image_url: undefined,
    width: 1200,
    height: 800,
    license_detected: "public_domain",
    license_confidence: 0.86,
    license_url: "https://creativecommons.org/publicdomain/mark/1.0/",
    source_access_mode: "archive_open_access",
    rights_status: "public_domain",
    reuse_risk: "low",
    risk_level: "low",
    scores: {
      relevance: 0.84,
      visual_quality: 0.76,
      source_credibility: 0.9,
      license_clarity: 0.88,
      uniqueness: 0.72,
      production_usefulness: 0.82,
      overall: 0.83
    },
    source_group: "institutional_archive",
    quality_reasons: ["Demo fixture: source-traceable public/archive candidate."],
    manual_review: normalizeManualReview({
      relevance: "pass",
      visual_usefulness: "pass",
      source_trust: "pass",
      license_status: "watch",
      verdict: "approved_reference",
      reviewer_note: "Demo review: verify original source page before publication.",
      reviewed_at: now
    }),
    ...overrides,
    tags: normalizeBoardTags(overrides.tags ?? ["demo", "archive", "public-domain"]),
    collected_at: overrides.collected_at ?? now,
    updated_at: overrides.updated_at ?? now
  });
}

function link(resultId: string, relation: ClaimSourceLink["relation"]): ClaimSourceLink {
  return { result_id: resultId, relation, linked_at: iso() };
}

export function createDemoProject(): ResearchProject {
  const now = iso();
  const project = createEmptyProject("Demo — Carthage Visual Evidence Board");
  const saved: ResearchResult[] = [
    demoResult({
      id: "demo_carthage_map_commons",
      title: "Carthage and western Mediterranean map candidate",
      source_url: "https://commons.wikimedia.org/wiki/Category:Maps_of_Carthage",
      source_domain: "commons.wikimedia.org",
      provider: "wikimedia",
      source_access_mode: "backend_free_no_key",
      rights_status: "open_license",
      license_detected: "creative_commons",
      license_url: "https://creativecommons.org/licenses/",
      section_id: "section_public_domain_candidates",
      notes: "Use as a starting point for map research. Verify exact file license and author before publication."
    }),
    demoResult({
      id: "demo_hannibal_alps_reference",
      title: "Hannibal crossing the Alps visual-reference candidate",
      source_url: "https://www.loc.gov/search/?fo=json&q=Hannibal%20crossing%20the%20Alps",
      source_domain: "loc.gov",
      provider: "loc",
      section_id: "section_primary_evidence",
      notes: "Primary archive/reference candidate. Confirm whether final image is public-domain or check-required."
    }),
    demoResult({
      id: "demo_reference_launcher_google",
      title: "Google Images manual reference search for Carthage documentary visuals",
      source_url: "https://www.google.com/search?tbm=isch&q=Carthage%20Hannibal%20historical%20map",
      source_domain: "google.com",
      provider: "manual",
      type: "web",
      source_group: "search_or_social",
      source_access_mode: "manual_reference_only",
      rights_status: "reference_only",
      reuse_risk: "medium",
      risk_level: "reference_only",
      license_detected: "unknown",
      license_url: undefined,
      section_id: "section_visual_reference",
      notes: "Launcher/reference-only card. Do not export as reusable media; import original source pages manually."
    })
  ];
  const claims: ResearchClaim[] = [
    {
      id: "demo_claim_geography",
      statement: "Carthage visuals need geographic context, not only portraits or battle scenes.",
      description: "A strong documentary board should include maps, routes, and Mediterranean spatial context.",
      confidence: "medium",
      status: "supported",
      tags: ["geography", "context"],
      source_links: [link("demo_carthage_map_commons", "supports"), link("demo_hannibal_alps_reference", "contextual")],
      created_at: now,
      updated_at: now
    },
    {
      id: "demo_claim_rights",
      statement: "Search-engine results should be treated as reference-only until the original source page is verified.",
      description: "The app separates manual launchers from backend free/open retrieval to avoid scraper behavior and rights ambiguity.",
      confidence: "high",
      status: "supported",
      tags: ["rights", "workflow"],
      source_links: [link("demo_reference_launcher_google", "visual_reference_only")],
      created_at: now,
      updated_at: now
    }
  ];

  return {
    ...project,
    saved_results: saved,
    claims,
    updated_at: now
  };
}
