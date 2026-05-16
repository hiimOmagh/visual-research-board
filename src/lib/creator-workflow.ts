export const CREATOR_WORKFLOW_VERSION = "2.4.0" as const;

export const CREATOR_WORKFLOW_DEMO_TITLE =
  "Premium documentary thumbnail research: Ancient Carthage and Mediterranean power";

export type CreatorUseCase =
  | "YouTube thumbnail"
  | "Documentary moodboard"
  | "Historical research board"
  | "Social media carousel"
  | "Presentation references"
  | "General visual research";

export type RiskTolerance = "strict" | "balanced" | "exploratory";

export type SourceClass =
  | "museum/open-access"
  | "bibliographic"
  | "web-image-discovery"
  | "stock/illustrative"
  | "manual-url"
  | "fixture-demo";

export type BoardSectionId =
  | "primary_visual_references"
  | "historical_source_evidence"
  | "style_mood_references"
  | "rejected_weak_references"
  | "export_candidates";

export type ReviewStatus = "unreviewed" | "saved" | "rejected" | "strong" | "weak_uncertain";

export interface ResearchBrief {
  topic: string;
  useCase: CreatorUseCase;
  visualStyle: string;
  platformOutputType: string;
  sourcePriority: string;
  riskTolerance: RiskTolerance;
  notes: string;
}

export interface CreatorQueryPlan {
  primaryQuery: string;
  expandedQueries: string[];
  sourceClasses: SourceClass[];
  routingReason: string;
  expectedResultTypes: string[];
}

export interface CreatorDiscoveryResult {
  id: string;
  title: string;
  sourceClass: SourceClass;
  sourceUrl: string;
  thumbnailHint: string;
  attributionText: string;
  rightsNotes: string;
  usageNotes: string;
  evidenceNotes: string;
}

export interface CreatorReview {
  resultId: string;
  status: ReviewStatus;
  sectionId: BoardSectionId;
  note: string;
  updatedAt: string;
}

export interface BoardSection {
  id: BoardSectionId;
  label: string;
  description: string;
}

export interface CreatorExportPack {
  schemaVersion: typeof CREATOR_WORKFLOW_VERSION;
  appVersion: typeof CREATOR_WORKFLOW_VERSION;
  timestamp: string;
  projectBrief: ResearchBrief;
  queryPlan: CreatorQueryPlan;
  savedReferences: Array<CreatorDiscoveryResult & { review: CreatorReview }>;
  sourceUrls: string[];
  attributionText: string[];
  usageRightsNotes: string[];
  reviewNotes: string[];
  missingCoverage: string[];
}

export const DEFAULT_RESEARCH_BRIEF: ResearchBrief = {
  topic: "Ancient Carthage and Mediterranean power",
  useCase: "YouTube thumbnail",
  visualStyle: "premium documentary, cinematic, historically grounded",
  platformOutputType: "YouTube thumbnail and short-form visual research board",
  sourcePriority: "museum/open-access, bibliographic, web-image-discovery, stock/illustrative",
  riskTolerance: "balanced",
  notes:
    "Prioritize credible visual references, source traceability, and clear usage/rights notes. Avoid fake live claims when providers are unavailable.",
};

export const BOARD_SECTIONS: BoardSection[] = [
  {
    id: "primary_visual_references",
    label: "Primary Visual References",
    description: "Core visual anchors that define the final creative direction.",
  },
  {
    id: "historical_source_evidence",
    label: "Historical / Source Evidence",
    description: "Research-backed sources, bibliographic leads, and provenance notes.",
  },
  {
    id: "style_mood_references",
    label: "Style / Mood References",
    description: "Composition, lighting, palette, and editorial mood references.",
  },
  {
    id: "rejected_weak_references",
    label: "Rejected / Weak References",
    description: "Rejected, uncertain, low-confidence, or rights-risky references.",
  },
  {
    id: "export_candidates",
    label: "Export Candidates",
    description: "Final references selected for the evidence pack export.",
  },
];

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

const unique = <T,>(items: T[]) => Array.from(new Set(items.filter(Boolean)));

export function buildCreatorQueryPlan(brief: ResearchBrief): CreatorQueryPlan {
  const topic = normalize(brief.topic) || DEFAULT_RESEARCH_BRIEF.topic;
  const useCase = brief.useCase || "General visual research";
  const visualStyle = normalize(brief.visualStyle) || "credible visual reference";
  const sourcePriority = brief.sourcePriority.toLowerCase();

  const sourceClasses = unique<SourceClass>([
    sourcePriority.includes("museum") || sourcePriority.includes("open")
      ? "museum/open-access"
      : "fixture-demo",
    sourcePriority.includes("book") || sourcePriority.includes("biblio")
      ? "bibliographic"
      : "bibliographic",
    sourcePriority.includes("image") || sourcePriority.includes("web")
      ? "web-image-discovery"
      : "web-image-discovery",
    sourcePriority.includes("stock") || sourcePriority.includes("illustrative")
      ? "stock/illustrative"
      : "stock/illustrative",
    "manual-url",
  ]);

  const expandedQueries = unique([
    topic,
    `${topic} ${useCase}`,
    `${topic} ${visualStyle}`,
    `${topic} open access museum reference`,
    `${topic} archaeology visual reference`,
    `${topic} bibliography source evidence`,
    `${topic} cinematic editorial moodboard`,
  ]);

  return {
    primaryQuery: topic,
    expandedQueries,
    sourceClasses,
    routingReason:
      "Routes the brief by source credibility, visual usefulness, rights clarity, and creator output type. Local fixture/demo mode remains explicit when live providers are unavailable.",
    expectedResultTypes: [
      "open-access object records",
      "bibliographic leads",
      "web image references",
      "stock or illustrative references",
      "manual URL references",
    ],
  };
}

export const DEMO_DISCOVERY_RESULTS: CreatorDiscoveryResult[] = [
  {
    id: "carthage-harbor-fixture",
    title: "Carthage harbor / cothon visual reference",
    sourceClass: "museum/open-access",
    sourceUrl: "fixture://museum-open-access/carthage-harbor",
    thumbnailHint: "Harbor geometry, ancient naval power, Mediterranean trade routes",
    attributionText: "Demo fixture — replace with verified museum/open-access object attribution.",
    rightsNotes: "Fixture/demo mode. Validate rights before publication.",
    usageNotes: "Use as a composition and research placeholder, not as final licensed art.",
    evidenceNotes: "Useful for the Carthaginian maritime-power angle.",
  },
  {
    id: "punic-wars-bibliographic-fixture",
    title: "Punic Wars bibliographic lead",
    sourceClass: "bibliographic",
    sourceUrl: "fixture://bibliographic/punic-wars-source-lead",
    thumbnailHint: "Historical conflict framing, Roman-Carthaginian strategic rivalry",
    attributionText: "Demo bibliographic lead — replace with actual citation metadata.",
    rightsNotes: "Bibliographic metadata only. Verify quoted or reproduced material separately.",
    usageNotes: "Use to guide fact-checking and narrative framing.",
    evidenceNotes: "Supports historical/source evidence section.",
  },
  {
    id: "mediterranean-power-mood-fixture",
    title: "Mediterranean power editorial mood reference",
    sourceClass: "stock/illustrative",
    sourceUrl: "fixture://stock-illustrative/mediterranean-power-mood",
    thumbnailHint: "Premium documentary lighting, map texture, dramatic contrast",
    attributionText: "Demo style reference — replace with licensed stock/illustrative source.",
    rightsNotes: "Fixture/demo mode. Do not treat as licensed asset.",
    usageNotes: "Use for mood, palette, and layout direction.",
    evidenceNotes: "Best used as style reference rather than historical evidence.",
  },
];

export function defaultSectionForResult(result: CreatorDiscoveryResult): BoardSectionId {
  if (result.sourceClass === "bibliographic") return "historical_source_evidence";
  if (result.sourceClass === "stock/illustrative") return "style_mood_references";
  return "primary_visual_references";
}

export function sectionForReview(
  result: CreatorDiscoveryResult,
  status: ReviewStatus,
): BoardSectionId {
  if (status === "rejected" || status === "weak_uncertain") return "rejected_weak_references";
  if (status === "strong") return "export_candidates";
  return defaultSectionForResult(result);
}

export function createReview(
  result: CreatorDiscoveryResult,
  status: ReviewStatus,
  note = "",
  now = new Date().toISOString(),
): CreatorReview {
  return {
    resultId: result.id,
    status,
    sectionId: sectionForReview(result, status),
    note,
    updatedAt: now,
  };
}

export function createCreatorExportPack(
  brief: ResearchBrief,
  queryPlan: CreatorQueryPlan,
  results: CreatorDiscoveryResult[],
  reviews: CreatorReview[],
  now = new Date().toISOString(),
): CreatorExportPack {
  const reviewById = new Map(reviews.map((review) => [review.resultId, review]));
  const savedReferences = results
    .filter((result) => {
      const review = reviewById.get(result.id);
      return review && ["saved", "strong", "weak_uncertain"].includes(review.status);
    })
    .map((result) => ({ ...result, review: reviewById.get(result.id)! }));

  const coveredSourceClasses = new Set(savedReferences.map((item) => item.sourceClass));
  const missingCoverage = queryPlan.sourceClasses
    .filter((sourceClass) => !coveredSourceClasses.has(sourceClass))
    .map((sourceClass) => `No saved reference yet for ${sourceClass}.`);

  return {
    schemaVersion: CREATOR_WORKFLOW_VERSION,
    appVersion: CREATOR_WORKFLOW_VERSION,
    timestamp: now,
    projectBrief: brief,
    queryPlan,
    savedReferences,
    sourceUrls: savedReferences.map((item) => item.sourceUrl),
    attributionText: savedReferences.map((item) => item.attributionText),
    usageRightsNotes: savedReferences.map((item) => item.rightsNotes),
    reviewNotes: savedReferences.map((item) => item.review.note).filter(Boolean),
    missingCoverage,
  };
}
