export const CREATOR_SESSION_VERSION = "2.3.0";

export type CreatorSessionStatus = "saved" | "rejected" | "strong" | "weak" | "export-candidate";

export type CreatorSessionBoardSection =
  | "Primary Visual References"
  | "Historical / Source Evidence"
  | "Style / Mood References"
  | "Rejected / Weak References"
  | "Export Candidates";

export type CreatorSessionBrief = {
  topic: string;
  useCase: string;
  visualStyle: string;
  platformOutputType: string;
  sourcePriority: string;
  riskTolerance: "low" | "medium" | "high";
  notes: string;
};

export type CreatorSessionReference = {
  id: string;
  title: string;
  sourceUrl: string;
  sourceClass: string;
  section: CreatorSessionBoardSection;
  status: CreatorSessionStatus;
  attribution: string;
  usageRightsNote: string;
  reviewNote: string;
  confidence: "high" | "medium" | "low";
};

export type CreatorSessionQueryPlan = {
  primaryQuery: string;
  expandedQueries: string[];
  sourceClasses: string[];
  routingReason: string;
  expectedResultTypes: string[];
};

export type CreatorSessionExportPreview = {
  schemaVersion: string;
  appVersion: string;
  projectBrief: CreatorSessionBrief;
  queryPlan: CreatorSessionQueryPlan;
  savedReferences: CreatorSessionReference[];
  sourceUrls: string[];
  attributionText: string[];
  usageRightsNotes: string[];
  reviewNotes: string[];
  missingCoverage: string[];
  timestamp: string;
};

export const creatorSessionBoardSections: CreatorSessionBoardSection[] = [
  "Primary Visual References",
  "Historical / Source Evidence",
  "Style / Mood References",
  "Rejected / Weak References",
  "Export Candidates",
];

export const creatorSessionDemoBrief: CreatorSessionBrief = {
  topic: "Ancient Carthage and Mediterranean power",
  useCase: "Premium documentary thumbnail research",
  visualStyle: "cinematic editorial, dark premium contrast, archaeological texture, restrained gold accents",
  platformOutputType: "YouTube documentary thumbnail and supporting source board",
  sourcePriority: "museum/open-access, bibliographic, historical evidence, then style references",
  riskTolerance: "low",
  notes: "Built-in fixture/demo mode; no fake live claims. Use as a realistic creator-session walkthrough.",
};

export const creatorSessionDemoQueryPlan: CreatorSessionQueryPlan = {
  primaryQuery: "Premium documentary thumbnail research: Ancient Carthage and Mediterranean power",
  expandedQueries: [
    "Ancient Carthage ruins Mediterranean power museum open access images",
    "Carthaginian navy Punic Wars archaeological references",
    "Carthage map Mediterranean trade routes public domain",
    "Phoenician Carthage artifacts museum collection",
  ],
  sourceClasses: [
    "museum-open-access",
    "bibliographic",
    "historical-source-evidence",
    "visual-style-reference",
  ],
  routingReason:
    "The brief needs historically grounded visual material first, then editorial style references. Open-access and bibliographic sources reduce rights risk; fixture/demo mode is transparent when real providers are unavailable.",
  expectedResultTypes: [
    "artifact images",
    "ruins and archaeological context",
    "maps and trade-route visuals",
    "book or article references",
    "thumbnail mood/style examples",
  ],
};

export const creatorSessionDemoReferences: CreatorSessionReference[] = [
  {
    id: "carthage-primary-harbor",
    title: "Carthage harbor / Mediterranean power visual anchor",
    sourceUrl: "fixture://carthage/harbor-reference",
    sourceClass: "historical-source-evidence",
    section: "Primary Visual References",
    status: "strong",
    attribution: "Fixture demo reference — Carthage harbor visual anchor",
    usageRightsNote: "Fixture/demo mode. Replace with verified source URL before publication.",
    reviewNote: "Strong composition anchor for a premium documentary thumbnail.",
    confidence: "medium",
  },
  {
    id: "carthage-evidence-artifact",
    title: "Carthaginian artifact evidence cue",
    sourceUrl: "fixture://carthage/artifact-evidence",
    sourceClass: "museum-open-access",
    section: "Historical / Source Evidence",
    status: "saved",
    attribution: "Fixture demo reference — Carthaginian artifact evidence cue",
    usageRightsNote: "Fixture/demo mode. Verify museum/source rights before use.",
    reviewNote: "Useful as evidence texture; not enough alone for final design.",
    confidence: "medium",
  },
  {
    id: "carthage-style-dark-editorial",
    title: "Dark editorial Mediterranean mood reference",
    sourceUrl: "fixture://carthage/dark-editorial-style",
    sourceClass: "visual-style-reference",
    section: "Style / Mood References",
    status: "saved",
    attribution: "Fixture demo reference — dark editorial Mediterranean mood",
    usageRightsNote: "Style reference only. Do not copy composition directly.",
    reviewNote: "Matches premium documentary tone and restrained dramatic contrast.",
    confidence: "high",
  },
  {
    id: "carthage-weak-generic-ruins",
    title: "Generic ruins image with uncertain Carthage specificity",
    sourceUrl: "fixture://carthage/generic-ruins-weak",
    sourceClass: "weak-uncertain",
    section: "Rejected / Weak References",
    status: "weak",
    attribution: "Fixture demo reference — generic ruins weak reference",
    usageRightsNote: "Weak/uncertain. Do not use without source verification.",
    reviewNote: "Potentially misleading because the site identity is uncertain.",
    confidence: "low",
  },
  {
    id: "carthage-export-candidate-map",
    title: "Mediterranean power map export candidate",
    sourceUrl: "fixture://carthage/mediterranean-power-map",
    sourceClass: "historical-map",
    section: "Export Candidates",
    status: "export-candidate",
    attribution: "Fixture demo reference — Mediterranean power map export candidate",
    usageRightsNote: "Fixture/demo mode. Replace with verified public-domain or licensed map.",
    reviewNote: "Good for evidence pack if rights and accuracy are verified.",
    confidence: "medium",
  },
];

export function buildCreatorSessionExportPreview(args?: {
  brief?: CreatorSessionBrief;
  queryPlan?: CreatorSessionQueryPlan;
  references?: CreatorSessionReference[];
  timestamp?: string;
}): CreatorSessionExportPreview {
  const brief = args?.brief ?? creatorSessionDemoBrief;
  const queryPlan = args?.queryPlan ?? creatorSessionDemoQueryPlan;
  const references = args?.references ?? creatorSessionDemoReferences;
  const savedReferences = references.filter((reference) => reference.status !== "rejected");
  const sourceUrls = savedReferences.map((reference) => reference.sourceUrl);
  const attributionText = savedReferences.map((reference) => reference.attribution);
  const usageRightsNotes = savedReferences.map((reference) => reference.usageRightsNote);
  const reviewNotes = savedReferences.map((reference) => reference.reviewNote).filter(Boolean);
  const sectionsWithReferences = new Set(savedReferences.map((reference) => reference.section));
  const missingCoverage = creatorSessionBoardSections
    .filter((section) => !sectionsWithReferences.has(section))
    .map((section) => `Missing coverage for ${section}`);

  return {
    schemaVersion: CREATOR_SESSION_VERSION,
    appVersion: CREATOR_SESSION_VERSION,
    projectBrief: brief,
    queryPlan,
    savedReferences,
    sourceUrls,
    attributionText,
    usageRightsNotes,
    reviewNotes,
    missingCoverage,
    timestamp: args?.timestamp ?? new Date().toISOString(),
  };
}

export function getCreatorSessionCoverageSuggestions(references = creatorSessionDemoReferences): string[] {
  const saved = references.filter((reference) => reference.status !== "rejected");
  const sectionsWithReferences = new Set(saved.map((reference) => reference.section));
  const suggestions = creatorSessionBoardSections
    .filter((section) => !sectionsWithReferences.has(section))
    .map((section) => `Add at least one reviewed item to ${section}.`);

  if (!saved.some((reference) => reference.usageRightsNote.toLowerCase().includes("verify"))) {
    suggestions.push("Confirm usage/rights notes before publication.");
  }

  if (!saved.some((reference) => reference.confidence === "high")) {
    suggestions.push("Mark at least one source as high-confidence before export.");
  }

  return suggestions.length > 0
    ? suggestions
    : ["Coverage looks complete for a first export preview. Verify live source rights before publication."];
}
