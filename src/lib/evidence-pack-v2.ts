export const APP_VERSION = "2.4.0";

export const EVIDENCE_PACK_V2_SCHEMA_VERSION = "evidence_pack_v2";

export const EVIDENCE_PACK_V2_SECTION_LABELS = [
  "Primary Visual References",
  "Historical / Source Evidence",
  "Style / Mood References",
  "Rejected / Weak References",
  "Export Candidates",
] as const;

export type EvidencePackV2SectionLabel = typeof EVIDENCE_PACK_V2_SECTION_LABELS[number];

export type EvidencePackV2Mode = "fixture_demo" | "local_creator_session";

export type EvidencePackV2Brief = {
  topic: string;
  use_case: string;
  visual_style: string;
  platform_output_type: string;
  source_priority: string;
  risk_tolerance: string;
  notes: string;
};

export type EvidencePackV2QueryPlan = {
  primary_query: string;
  expanded_queries: string[];
  source_classes: string[];
  reason_for_routing: string;
  expected_result_types: string[];
};

export type EvidencePackV2SavedReference = {
  id: string;
  title: string;
  section: EvidencePackV2SectionLabel;
  source_url: string;
  attribution_text: string;
  usage_rights_notes: string;
  review_note: string;
  review_status: "strong_reference" | "weak_uncertain" | "rejected" | "export_candidate";
};

export type EvidencePackV2Input = {
  brief?: Partial<EvidencePackV2Brief>;
  query_plan?: Partial<EvidencePackV2QueryPlan>;
  saved_references?: EvidencePackV2SavedReference[];
  missing_coverage?: string[];
  timestamp?: string;
  mode?: EvidencePackV2Mode;
};

export type EvidencePackV2 = {
  schema_version: typeof EVIDENCE_PACK_V2_SCHEMA_VERSION;
  app_version: typeof APP_VERSION;
  generated_at: string;
  mode: EvidencePackV2Mode;
  fixture_demo_disclosure: string | null;
  project_brief: EvidencePackV2Brief;
  query_plan: EvidencePackV2QueryPlan;
  saved_references_by_section: Record<EvidencePackV2SectionLabel, EvidencePackV2SavedReference[]>;
  source_urls: string[];
  attribution_texts: string[];
  usage_rights_notes: string[];
  review_notes: string[];
  rejected_weak_references_summary: string[];
  missing_coverage: string[];
};

const EMPTY_BRIEF: EvidencePackV2Brief = {
  topic: "Untitled creator research session",
  use_case: "Not specified",
  visual_style: "Not specified",
  platform_output_type: "Not specified",
  source_priority: "Balanced",
  risk_tolerance: "Medium",
  notes: "No additional brief notes provided.",
};

const EMPTY_QUERY_PLAN: EvidencePackV2QueryPlan = {
  primary_query: "No query planned yet.",
  expanded_queries: [],
  source_classes: [],
  reason_for_routing: "No routing decision recorded yet.",
  expected_result_types: [],
};

export const CARTHAGE_EVIDENCE_PACK_V2_DEMO_BRIEF: EvidencePackV2Brief = {
  topic: "Ancient Carthage and Mediterranean power",
  use_case: "Premium documentary thumbnail research",
  visual_style: "Cinematic editorial, historically grounded, high-contrast Mediterranean atmosphere",
  platform_output_type: "YouTube documentary thumbnail and research board",
  source_priority: "Museum/open-access first, then scholarly and illustrative references",
  risk_tolerance: "Low: avoid fake artifacts, anachronistic armor, and unsourced reconstructions",
  notes: "Prioritize credible ancient material culture, Punic/Carthaginian context, Mediterranean trade power, and source-aware visual mood references.",
};

export const CARTHAGE_EVIDENCE_PACK_V2_DEMO_QUERY_PLAN: EvidencePackV2QueryPlan = {
  primary_query: "Ancient Carthage Mediterranean power visual references",
  expanded_queries: [
    "Carthaginian Punic artifacts open access museum",
    "Carthage harbor Mediterranean trade ancient history references",
    "Hannibal Carthage documentary thumbnail visual mood",
    "Phoenician Punic material culture museum collection",
  ],
  source_classes: [
    "museum_open_access",
    "bibliographic_reference",
    "broad_web_image",
    "style_mood_reference",
  ],
  reason_for_routing: "The topic needs a credibility-first mix: museum artifacts for evidence, bibliographic sources for historical grounding, and carefully labeled mood references for thumbnail composition.",
  expected_result_types: [
    "artifact photographs",
    "maps and site photographs",
    "book or article references",
    "cinematic mood references",
  ],
};

export const CARTHAGE_EVIDENCE_PACK_V2_DEMO_REFERENCES: EvidencePackV2SavedReference[] = [
  {
    id: "carthage-artifact-coin",
    title: "Punic coin / material culture reference",
    section: "Primary Visual References",
    source_url: "https://www.britishmuseum.org/collection/search?keyword=Carthage",
    attribution_text: "British Museum collection search for Carthage/Punic material culture.",
    usage_rights_notes: "Verify the individual object page rights statement before production use.",
    review_note: "Strong thumbnail detail candidate: authentic object texture, readable ancient identity, low sensationalism.",
    review_status: "strong_reference",
  },
  {
    id: "carthage-harbor-context",
    title: "Carthage harbor and Mediterranean power context",
    section: "Historical / Source Evidence",
    source_url: "https://whc.unesco.org/en/list/37/",
    attribution_text: "UNESCO World Heritage Centre entry for the Archaeological Site of Carthage.",
    usage_rights_notes: "Use as source context; do not assume image reuse rights from the page.",
    review_note: "Useful for grounding the visual narrative around maritime power and urban scale.",
    review_status: "export_candidate",
  },
  {
    id: "carthage-style-mood",
    title: "Dark Mediterranean editorial mood reference",
    section: "Style / Mood References",
    source_url: "fixture://visual-mood/dark-mediterranean-editorial",
    attribution_text: "Local fixture mood reference generated for composition planning only.",
    usage_rights_notes: "Fixture/demo mode: not a live source and not a rights-cleared production asset.",
    review_note: "Use only as mood direction: bronze, deep sea blue, stone texture, restrained gold highlights.",
    review_status: "weak_uncertain",
  },
  {
    id: "carthage-rejected-ai-warrior",
    title: "Rejected generic AI warrior image",
    section: "Rejected / Weak References",
    source_url: "fixture://rejected/generic-ai-warrior",
    attribution_text: "Rejected local fixture reference.",
    usage_rights_notes: "Rejected because identity, armor, and period details are not source-grounded.",
    review_note: "Avoid: looks dramatic but weakens historical trust and may introduce false visual claims.",
    review_status: "rejected",
  },
  {
    id: "carthage-export-candidate-map",
    title: "Mediterranean trade-route map candidate",
    section: "Export Candidates",
    source_url: "fixture://export-candidate/mediterranean-trade-route-map",
    attribution_text: "Local export candidate placeholder for a rights-checked map source.",
    usage_rights_notes: "Replace with a rights-checked map or self-made simplified map before publication.",
    review_note: "Good structural thumbnail layer if simplified and not overloaded.",
    review_status: "export_candidate",
  },
];

export const CARTHAGE_EVIDENCE_PACK_V2_MISSING_COVERAGE = [
  "Need rights-cleared high-resolution artifact image before publication.",
  "Need a verified map source or self-made map for Mediterranean trade routes.",
  "Need a scholarly citation for the specific claim used in the video title or thumbnail text.",
  "Need final check against anachronistic armor, flags, and Roman-era visual drift.",
];

const normalizeText = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

const isSectionLabel = (value: string): value is EvidencePackV2SectionLabel =>
  EVIDENCE_PACK_V2_SECTION_LABELS.includes(value as EvidencePackV2SectionLabel);

const emptySectionMap = (): Record<EvidencePackV2SectionLabel, EvidencePackV2SavedReference[]> =>
  Object.fromEntries(EVIDENCE_PACK_V2_SECTION_LABELS.map((section) => [section, []])) as unknown as Record<
    EvidencePackV2SectionLabel,
    EvidencePackV2SavedReference[]
  >;

export const buildEvidencePackV2 = (input: EvidencePackV2Input = {}): EvidencePackV2 => {
  const mode = input.mode ?? "local_creator_session";
  const brief = input.brief ?? {};
  const queryPlan = input.query_plan ?? {};
  const timestamp = normalizeText(input.timestamp, new Date(0).toISOString());
  const grouped = emptySectionMap();

  const savedReferences = [...(input.saved_references ?? [])]
    .map((reference, index): EvidencePackV2SavedReference => {
      const section = isSectionLabel(reference.section) ? reference.section : "Export Candidates";
      return {
        id: normalizeText(reference.id, `reference-${index + 1}`),
        title: normalizeText(reference.title, "Untitled reference"),
        section,
        source_url: normalizeText(reference.source_url, "No source URL recorded"),
        attribution_text: normalizeText(reference.attribution_text, "No attribution text recorded"),
        usage_rights_notes: normalizeText(reference.usage_rights_notes, "No usage or rights notes recorded"),
        review_note: normalizeText(reference.review_note, "No review note recorded"),
        review_status: reference.review_status ?? "export_candidate",
      };
    })
    .sort((a, b) => a.section.localeCompare(b.section) || a.title.localeCompare(b.title));

  for (const reference of savedReferences) {
    grouped[reference.section].push(reference);
  }

  const sourceUrls = savedReferences
    .map((reference) => reference.source_url)
    .filter((value, index, list) => value !== "No source URL recorded" && list.indexOf(value) === index);

  const attributionTexts = savedReferences
    .map((reference) => reference.attribution_text)
    .filter((value, index, list) => value !== "No attribution text recorded" && list.indexOf(value) === index);

  const usageRightsNotes = savedReferences
    .map((reference) => reference.usage_rights_notes)
    .filter((value, index, list) => value !== "No usage or rights notes recorded" && list.indexOf(value) === index);

  const reviewNotes = savedReferences
    .map((reference) => reference.review_note)
    .filter((value, index, list) => value !== "No review note recorded" && list.indexOf(value) === index);

  const rejectedWeakSummary = savedReferences
    .filter((reference) => reference.review_status === "rejected" || reference.review_status === "weak_uncertain")
    .map((reference) => `${reference.title} - ${reference.review_note}`);

  return {
    schema_version: EVIDENCE_PACK_V2_SCHEMA_VERSION,
    app_version: APP_VERSION,
    generated_at: timestamp,
    mode,
    fixture_demo_disclosure:
      mode === "fixture_demo"
        ? "Fixture/demo mode disclosure: this export may include local placeholders and must not be represented as live retrieval evidence."
        : null,
    project_brief: {
      topic: normalizeText(brief.topic, EMPTY_BRIEF.topic),
      use_case: normalizeText(brief.use_case, EMPTY_BRIEF.use_case),
      visual_style: normalizeText(brief.visual_style, EMPTY_BRIEF.visual_style),
      platform_output_type: normalizeText(brief.platform_output_type, EMPTY_BRIEF.platform_output_type),
      source_priority: normalizeText(brief.source_priority, EMPTY_BRIEF.source_priority),
      risk_tolerance: normalizeText(brief.risk_tolerance, EMPTY_BRIEF.risk_tolerance),
      notes: normalizeText(brief.notes, EMPTY_BRIEF.notes),
    },
    query_plan: {
      primary_query: normalizeText(queryPlan.primary_query, EMPTY_QUERY_PLAN.primary_query),
      expanded_queries: normalizeStringList(queryPlan.expanded_queries),
      source_classes: normalizeStringList(queryPlan.source_classes),
      reason_for_routing: normalizeText(queryPlan.reason_for_routing, EMPTY_QUERY_PLAN.reason_for_routing),
      expected_result_types: normalizeStringList(queryPlan.expected_result_types),
    },
    saved_references_by_section: grouped,
    source_urls: sourceUrls,
    attribution_texts: attributionTexts,
    usage_rights_notes: usageRightsNotes,
    review_notes: reviewNotes,
    rejected_weak_references_summary: rejectedWeakSummary,
    missing_coverage: normalizeStringList(input.missing_coverage),
  };
};

const listOrFallback = (items: string[], fallback: string): string[] =>
  items.length > 0 ? items.map((item) => `- ${item}`) : [`- ${fallback}`];

export const buildEvidencePackV2Markdown = (pack: EvidencePackV2): string => {
  const lines = [
    `# Evidence Pack v2 - ${pack.project_brief.topic}`,
    "",
    `Generated: ${pack.generated_at}`,
    `Schema: ${pack.schema_version}`,
    `App version: ${pack.app_version}`,
    `Mode: ${pack.mode}`,
  ];

  if (pack.fixture_demo_disclosure) {
    lines.push("", `> ${pack.fixture_demo_disclosure}`);
  }

  lines.push(
    "",
    "## Project brief",
    `- Topic: ${pack.project_brief.topic}`,
    `- Use case: ${pack.project_brief.use_case}`,
    `- Visual style: ${pack.project_brief.visual_style}`,
    `- Platform/output type: ${pack.project_brief.platform_output_type}`,
    `- Source priority: ${pack.project_brief.source_priority}`,
    `- Risk tolerance: ${pack.project_brief.risk_tolerance}`,
    `- Notes: ${pack.project_brief.notes}`,
    "",
    "## Query plan",
    `- Primary query: ${pack.query_plan.primary_query}`,
    `- Reason for routing: ${pack.query_plan.reason_for_routing}`,
    "",
    "### Expanded queries",
    ...listOrFallback(pack.query_plan.expanded_queries, "No expanded queries recorded."),
    "",
    "### Source classes",
    ...listOrFallback(pack.query_plan.source_classes, "No source classes recorded."),
    "",
    "### Expected result types",
    ...listOrFallback(pack.query_plan.expected_result_types, "No expected result types recorded."),
    "",
    "## Saved references",
  );

  for (const section of EVIDENCE_PACK_V2_SECTION_LABELS) {
    const references = pack.saved_references_by_section[section];
    lines.push("", `### ${section}`);
    if (references.length === 0) {
      lines.push("- No saved references in this section.");
      continue;
    }

    for (const reference of references) {
      lines.push(
        `- ${reference.title}`,
        `  - Source URL: ${reference.source_url}`,
        `  - Attribution: ${reference.attribution_text}`,
        `  - Usage/rights notes: ${reference.usage_rights_notes}`,
        `  - Review notes: ${reference.review_note}`,
        `  - Review status: ${reference.review_status}`,
      );
    }
  }

  lines.push(
    "",
    "## Source URLs",
    ...listOrFallback(pack.source_urls, "No source URLs recorded."),
    "",
    "## Attribution text",
    ...listOrFallback(pack.attribution_texts, "No attribution text recorded."),
    "",
    "## Usage/rights notes",
    ...listOrFallback(pack.usage_rights_notes, "No usage or rights notes recorded."),
    "",
    "## Review notes",
    ...listOrFallback(pack.review_notes, "No review notes recorded."),
    "",
    "## Rejected / weak references summary",
    ...listOrFallback(pack.rejected_weak_references_summary, "No rejected or weak references recorded."),
    "",
    "## Missing coverage",
    ...listOrFallback(pack.missing_coverage, "No missing coverage recorded."),
    "",
  );

  return lines.join("\n");
};

export const toEvidencePackV2Json = (pack: EvidencePackV2): string =>
  JSON.stringify(pack, null, 2);

export const buildCarthageDemoEvidencePackV2 = (options: { timestamp?: string } = {}): EvidencePackV2 =>
  buildEvidencePackV2({
    brief: CARTHAGE_EVIDENCE_PACK_V2_DEMO_BRIEF,
    query_plan: CARTHAGE_EVIDENCE_PACK_V2_DEMO_QUERY_PLAN,
    saved_references: CARTHAGE_EVIDENCE_PACK_V2_DEMO_REFERENCES,
    missing_coverage: CARTHAGE_EVIDENCE_PACK_V2_MISSING_COVERAGE,
    timestamp: options.timestamp ?? new Date(0).toISOString(),
    mode: "fixture_demo",
  });
