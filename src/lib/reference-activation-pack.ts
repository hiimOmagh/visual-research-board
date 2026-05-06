
import type { BroadReferenceResult } from "@/types/broad-reference-result";
import type {
  ReferenceActivationPack,
  ReferenceActivationPackInput,
  ReferenceActivationPackSection,
  ReferenceActivationSource,
  ReferenceActivationSourceRole
} from "@/types/reference-activation-pack";

export function createReferenceActivationPack(input: ReferenceActivationPackInput): ReferenceActivationPack {
  const sourceRoles = input.results.map(createReferenceActivationSource);
  const visualSources = sourceRoles.filter((source) => source.role === "visual_reference" || source.role === "style_direction");
  const researchSources = sourceRoles.filter((source) => source.role !== "visual_reference" && source.role !== "style_direction");

  return {
    id: input.id ?? createStableActivationPackId(input.query, input.results),
    title: input.title,
    query: input.query,
    pack_type: input.pack_type ?? "research_brief",
    summary: input.summary ?? createActivationSummary(input.results),
    visual_direction: createVisualDirectionSection(visualSources),
    research_context: createResearchContextSection(researchSources),
    source_roles: sourceRoles,
    risk_access_notes: createRiskAccessNotes(input.results),
    activation_next_steps: createActivationNextSteps(input.results),
    constraints: [
      "No image generation is performed by this pack.",
      "No scraping, paywall bypass, access circumvention, or copyrighted text extraction is performed.",
      "Use the pack as structured metadata, source context, and brief text only.",
      "Review rights, access, and platform restrictions before publication or reuse."
    ],
    created_from_result_count: input.results.length
  };
}

export function createReferenceActivationSource(result: BroadReferenceResult): ReferenceActivationSource {
  const role = inferReferenceActivationSourceRole(result);

  return {
    result_id: result.id,
    source_url: result.source_url,
    title: result.title,
    source_class: result.source_class,
    role,
    use_note: createUseNote(result, role),
    risk_access_note: createRiskAccessNote(result)
  };
}

export function inferReferenceActivationSourceRole(result: BroadReferenceResult): ReferenceActivationSourceRole {
  if (result.source_class === "book") return "bibliography";
  if (result.source_class === "social_media") return "trend_signal";
  if (result.source_class === "web_image" || result.source_class === "museum" || result.source_class === "stock") {
    return "visual_reference";
  }
  if (result.reference_intelligence?.evidence_role === "contradiction") return "contradiction";
  if (result.reference_intelligence?.evidence_role === "claim_support") return "claim_support";
  if (result.risk_level === "high" || result.risk_level === "unknown") return "risk_note";
  return "context_anchor";
}

export function createActivationSummary(results: BroadReferenceResult[]): string {
  const classes = [...new Set(results.map((result) => result.source_class))].join(", ") || "no sources";
  return `Activation pack built from ${results.length} reference result(s), covering source classes: ${classes}.`;
}

export function createRiskAccessNotes(results: BroadReferenceResult[]): string[] {
  if (results.length === 0) {
    return ["No references were provided. Add board results before activation."];
  }

  return results.map((result) => {
    const title = result.title ?? result.source_url;
    return `${title}: access=${result.access_status}, rights=${result.rights_status}, risk=${result.risk_level}.`;
  });
}

export function createActivationNextSteps(results: BroadReferenceResult[]): string[] {
  const steps = [
    "Review source roles and remove weak or irrelevant references.",
    "Verify source URLs and access status.",
    "Separate visual direction from claim-supporting sources.",
    "Convert the pack into a production or research brief only after rights/access review."
  ];

  if (results.some((result) => result.source_class === "book")) {
    steps.push("Confirm bibliographic metadata and page/chapter notes for book references.");
  }

  if (results.some((result) => result.source_class === "social_media")) {
    steps.push("Check platform restrictions before using social references beyond context or inspiration.");
  }

  return steps;
}

function createVisualDirectionSection(sources: ReferenceActivationSource[]): ReferenceActivationPackSection {
  return {
    id: "visual_direction",
    title: "Visual direction",
    body:
      sources.length > 0
        ? "Use visual references for composition, mood, style, color, and visual-context decisions. Do not treat them as owned assets."
        : "No primary visual references were detected. Add image, museum, stock, or visual-context references for stronger visual direction.",
    source_ids: sources.map((source) => source.result_id)
  };
}

function createResearchContextSection(sources: ReferenceActivationSource[]): ReferenceActivationPackSection {
  return {
    id: "research_context",
    title: "Research context",
    body:
      sources.length > 0
        ? "Use research references for context, claims, bibliography, contradictions, and source mapping. Verify claims before publication."
        : "No research-context references were detected. Add web, book, archive, or claim-supporting references for stronger context.",
    source_ids: sources.map((source) => source.result_id)
  };
}

function createUseNote(result: BroadReferenceResult, role: ReferenceActivationSourceRole): string {
  if (role === "bibliography") return "Use as a bibliographic or research-context anchor.";
  if (role === "trend_signal") return "Use as public platform or trend context, not as owned media.";
  if (role === "visual_reference") return "Use as visual direction or inspiration, not as a reusable asset.";
  if (role === "claim_support") return "Use as claim-supporting context after verification.";
  if (role === "risk_note") return "Use only after access, rights, and risk review.";
  return `Use as ${role.replaceAll("_", " ")}.`;
}

function createRiskAccessNote(result: BroadReferenceResult): string {
  return `access=${result.access_status}; rights=${result.rights_status}; risk=${result.risk_level}`;
}

function createStableActivationPackId(query: string, results: BroadReferenceResult[]): string {
  const seed = `${query}:${results.map((result) => result.id).join("|")}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 41 + seed.charCodeAt(i)) >>> 0;
  }
  return "activation_" + hash.toString(16);
}
