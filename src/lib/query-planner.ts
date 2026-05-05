import type {
  ProviderRoutingPlanEntry,
  QueryIntent,
  QueryVariant,
  ResearchRequest,
  SearchPlan,
  SearchProviderName,
  SearchSourceTarget,
  SourceClass,
  SourceClassRoutingTrace
} from "@/types/research";

const modeQueryExpansions: Record<ResearchRequest["mode"], Array<{ term: string; intent: QueryIntent; classes: SourceClass[]; reason: string }>> = {
  person_reference: [
    { term: "official portrait source", intent: "web", classes: ["web_context", "open_media"], reason: "official source and portrait discovery" },
    { term: "public appearance high resolution", intent: "visual", classes: ["open_media", "news_reference"], reason: "current/public visual reference branch" },
    { term: "profile image source", intent: "visual", classes: ["open_media", "web_context"], reason: "profile image discovery" },
    { term: "Wikimedia Commons portrait", intent: "public_domain", classes: ["open_media"], reason: "open-media portrait branch" },
    { term: "archive image", intent: "archive", classes: ["archive"], reason: "archive portrait branch" }
  ],
  historical_topic: [
    { term: "historical map archive", intent: "archive", classes: ["archive", "open_media"], reason: "historical-map archive branch" },
    { term: "museum collection image", intent: "museum", classes: ["museum", "archive"], reason: "museum/open-access branch" },
    { term: "public domain illustration", intent: "public_domain", classes: ["open_media", "archive"], reason: "reuse-friendly illustration branch" },
    { term: "primary source document", intent: "archive", classes: ["archive", "academic_context"], reason: "primary-source branch" },
    { term: "old photograph archive", intent: "archive", classes: ["archive", "open_media"], reason: "historical photo branch" },
    { term: "painting engraving illustration", intent: "museum", classes: ["museum", "open_media"], reason: "artifact/artwork branch" }
  ],
  youtube_documentary: [
    { term: "documentary visual references", intent: "visual", classes: ["open_media", "manual_reference"], reason: "documentary visual discovery" },
    { term: "explainer map source", intent: "archive", classes: ["archive", "web_context"], reason: "map/explainer source branch" },
    { term: "timeline source images", intent: "archive", classes: ["archive", "open_media"], reason: "timeline visual branch" },
    { term: "public domain visuals", intent: "public_domain", classes: ["open_media", "archive"], reason: "low-risk visual branch" },
    { term: "museum archive image", intent: "museum", classes: ["museum", "archive"], reason: "museum/archive documentary branch" },
    { term: "editorial photo reference", intent: "reference", classes: ["manual_reference", "news_reference"], reason: "manual reference-search branch" }
  ],
  thumbnail_inspiration: [
    { term: "thumbnail composition reference", intent: "stock", classes: ["manual_reference", "stock"], reason: "composition inspiration branch" },
    { term: "dramatic editorial image", intent: "reference", classes: ["manual_reference", "news_reference"], reason: "reference-only editorial inspiration" },
    { term: "high contrast visual reference", intent: "stock", classes: ["stock", "manual_reference"], reason: "stock/visual design branch" },
    { term: "cinematic poster composition", intent: "reference", classes: ["manual_reference"], reason: "manual search inspiration branch" },
    { term: "public domain poster", intent: "public_domain", classes: ["archive", "open_media"], reason: "low-risk poster branch" }
  ],
  public_domain: [
    { term: "public domain image", intent: "public_domain", classes: ["open_media", "archive"], reason: "public-domain core branch" },
    { term: "Wikimedia Commons public domain", intent: "public_domain", classes: ["open_media"], reason: "Commons public-domain branch" },
    { term: "CC0 image archive", intent: "public_domain", classes: ["open_media", "archive"], reason: "CC0/open-license branch" },
    { term: "Library of Congress public domain", intent: "archive", classes: ["archive"], reason: "LOC public-domain branch" },
    { term: "museum open access image", intent: "museum", classes: ["museum", "open_media"], reason: "museum open-access branch" },
    { term: "Internet Archive image", intent: "archive", classes: ["archive"], reason: "Internet Archive image branch" }
  ],
  news_event: [
    { term: "latest official source", intent: "news", classes: ["news_reference", "web_context"], reason: "official/latest context branch" },
    { term: "news timeline source", intent: "news", classes: ["news_reference", "web_context"], reason: "timeline context branch" },
    { term: "press release images", intent: "news", classes: ["news_reference", "web_context"], reason: "official press image branch" },
    { term: "agency photo reference", intent: "reference", classes: ["manual_reference", "news_reference"], reason: "reference-only agency photo branch" },
    { term: "background visuals", intent: "visual", classes: ["open_media", "manual_reference"], reason: "background visual branch" }
  ],
  design_moodboard: [
    { term: "visual style reference", intent: "reference", classes: ["manual_reference", "stock"], reason: "manual style reference branch" },
    { term: "color palette moodboard", intent: "stock", classes: ["stock", "manual_reference"], reason: "moodboard visual branch" },
    { term: "lighting reference image", intent: "stock", classes: ["stock", "manual_reference"], reason: "lighting reference branch" },
    { term: "editorial layout inspiration", intent: "reference", classes: ["manual_reference"], reason: "manual layout inspiration branch" },
    { term: "public domain design poster", intent: "public_domain", classes: ["archive", "open_media"], reason: "open poster/design branch" }
  ],
  academic_source_pack: [
    { term: "official report pdf", intent: "academic", classes: ["academic_context", "web_context"], reason: "official report branch" },
    { term: "academic paper source", intent: "academic", classes: ["academic_context", "web_context"], reason: "academic source branch" },
    { term: "institutional publication", intent: "academic", classes: ["academic_context", "web_context"], reason: "institutional source branch" },
    { term: "primary source document", intent: "archive", classes: ["archive", "academic_context"], reason: "primary-source archive branch" },
    { term: "chart data source", intent: "academic", classes: ["academic_context", "web_context"], reason: "data/chart branch" },
    { term: "visual evidence source", intent: "visual", classes: ["open_media", "academic_context"], reason: "visual evidence branch" }
  ]
};

const multilingualExpansions: Array<{ suffix: string; language_hint: QueryVariant["language_hint"]; classes: SourceClass[]; intent: QueryIntent; reason: string }> = [
  { suffix: "صورة أرشيفية", language_hint: "ar", classes: ["archive", "manual_reference"], intent: "archive", reason: "Arabic archive query variant" },
  { suffix: "image archive", language_hint: "en", classes: ["archive", "open_media"], intent: "archive", reason: "English archive query variant" },
  { suffix: "carte historique", language_hint: "fr", classes: ["archive", "museum"], intent: "archive", reason: "French historical-map query variant" },
  { suffix: "historische Karte", language_hint: "de", classes: ["archive", "museum"], intent: "archive", reason: "German historical-map query variant" }
];

const depthVariantCounts: Record<ResearchRequest["depth"], number> = {
  quick: 10,
  standard: 18,
  deep: 28
};

const providerMaxQueries: Record<SearchProviderName, Record<ResearchRequest["depth"], number>> = {
  mock: { quick: 4, standard: 6, deep: 8 },
  wikimedia: { quick: 3, standard: 5, deep: 7 },
  openverse: { quick: 3, standard: 5, deep: 7 },
  loc: { quick: 2, standard: 4, deep: 6 },
  internet_archive: { quick: 2, standard: 4, deep: 6 },
  nasa: { quick: 2, standard: 3, deep: 5 },
  smithsonian: { quick: 2, standard: 4, deep: 6 },
  europeana: { quick: 2, standard: 4, deep: 6 },
  met: { quick: 2, standard: 4, deep: 6 },
  artic: { quick: 2, standard: 4, deep: 6 },
  cleveland_museum: { quick: 2, standard: 4, deep: 6 },
  rijksmuseum: { quick: 2, standard: 4, deep: 6 },
  wellcome: { quick: 2, standard: 4, deep: 6 },
  bhl: { quick: 2, standard: 4, deep: 6 },
  gallica: { quick: 2, standard: 4, deep: 6 },
  nypl: { quick: 2, standard: 4, deep: 6 },
  nara: { quick: 2, standard: 4, deep: 6 },
  dpla: { quick: 2, standard: 4, deep: 6 },
  brave: { quick: 3, standard: 5, deep: 8 },
  tavily: { quick: 3, standard: 5, deep: 8 }
};

const providerClassMap: Record<SearchProviderName, SourceClass[]> = {
  mock: ["open_media", "archive", "museum", "science", "manual_reference", "web_context", "news_reference", "stock", "academic_context"],
  wikimedia: ["open_media", "archive", "museum", "science"],
  openverse: ["open_media", "stock"],
  loc: ["archive", "open_media", "academic_context"],
  internet_archive: ["archive", "academic_context", "open_media"],
  nasa: ["science", "archive", "open_media"],
  smithsonian: ["museum", "science", "archive", "open_media"],
  europeana: ["museum", "archive", "open_media", "academic_context"],
  met: ["museum", "archive", "open_media"],
  artic: ["museum", "archive", "open_media"],
  cleveland_museum: ["museum", "archive", "open_media"],
  rijksmuseum: ["museum", "archive", "open_media"],
  wellcome: ["museum", "archive", "science", "open_media"],
  bhl: ["museum", "archive", "science", "academic_context"],
  gallica: ["museum", "archive", "open_media", "academic_context"],
  nypl: ["museum", "archive", "open_media"],
  nara: ["archive", "open_media", "academic_context"],
  dpla: ["museum", "archive", "open_media", "academic_context"],
  brave: ["manual_reference", "news_reference", "web_context", "open_media", "stock"],
  tavily: ["web_context", "news_reference", "academic_context", "manual_reference"]
};

const providerTargetMap: Record<SearchProviderName, SearchSourceTarget[]> = {
  mock: ["image", "web", "news", "archive", "commons"],
  wikimedia: ["commons", "image", "archive"],
  openverse: ["image", "commons"],
  loc: ["archive", "image"],
  internet_archive: ["archive", "image"],
  nasa: ["image", "archive"],
  smithsonian: ["archive", "image", "commons"],
  europeana: ["archive", "image"],
  met: ["archive", "image", "commons"],
  artic: ["archive", "image", "commons"],
  cleveland_museum: ["archive", "image", "commons"],
  rijksmuseum: ["archive", "image", "commons"],
  wellcome: ["archive", "image", "commons"],
  bhl: ["archive", "image"],
  gallica: ["archive", "image", "commons"],
  nypl: ["archive", "image", "commons"],
  nara: ["archive", "image"],
  dpla: ["archive", "image", "commons"],
  brave: ["image", "web", "news"],
  tavily: ["web", "news", "image"]
};

function sourceTargetsForMode(mode: ResearchRequest["mode"]): SearchSourceTarget[] {
  if (mode === "public_domain") return ["commons", "archive", "image", "web"];
  if (mode === "news_event") return ["news", "image", "web", "archive"];
  if (mode === "academic_source_pack") return ["web", "archive", "commons", "image"];
  if (mode === "historical_topic") return ["commons", "archive", "image", "web"];
  if (mode === "thumbnail_inspiration" || mode === "design_moodboard") return ["image", "web", "commons"];
  return ["image", "web", "commons", "archive"];
}

function providersForClasses(classes: SourceClass[], sourceTargets: SearchSourceTarget[]): SearchProviderName[] {
  const classSet = new Set(classes);
  return (Object.keys(providerClassMap) as SearchProviderName[]).filter((provider) => {
    const targetOk = providerTargetMap[provider].some((target) => sourceTargets.includes(target));
    const classOk = providerClassMap[provider].some((sourceClass) => classSet.has(sourceClass));
    return targetOk && classOk;
  });
}

function uniqueVariants(variants: Array<Omit<QueryVariant, "id" | "provider_targets">>): Array<Omit<QueryVariant, "id" | "provider_targets">> {
  const seen = new Set<string>();
  return variants
    .map((variant) => ({ ...variant, query: variant.query.replace(/\s+/g, " ").trim() }))
    .filter((variant) => variant.query.length > 1)
    .filter((variant) => {
      const key = `${variant.query.toLowerCase()}::${variant.intent}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.priority - b.priority || a.query.length - b.query.length);
}

function variantId(index: number): string {
  return `qv_${String(index + 1).padStart(2, "0")}`;
}

function createQueryVariants(topic: string, mode: ResearchRequest["mode"], sourceTargets: SearchSourceTarget[]): QueryVariant[] {
  const variants: Omit<QueryVariant, "id" | "provider_targets">[] = [
    {
      query: topic,
      intent: "exact",
      source_classes: ["open_media", "archive", "web_context"],
      priority: 1,
      reason: "exact user topic baseline"
    },
    {
      query: `${topic} images`,
      intent: "visual",
      source_classes: ["open_media", "manual_reference"],
      priority: 4,
      reason: "generic visual branch"
    },
    {
      query: `${topic} public domain image`,
      intent: "public_domain",
      source_classes: ["open_media", "archive"],
      priority: 5,
      reason: "open/reusable image branch"
    }
  ];

  for (const [index, expansion] of (modeQueryExpansions[mode] ?? []).entries()) {
    variants.push({
      query: `${topic} ${expansion.term}`,
      intent: expansion.intent,
      source_classes: expansion.classes,
      priority: 8 + index,
      reason: expansion.reason
    });
  }

  if (mode === "historical_topic" || mode === "public_domain" || mode === "youtube_documentary") {
    multilingualExpansions.forEach((entry, index) => {
      variants.push({
        query: `${topic} ${entry.suffix}`,
        intent: entry.intent,
        source_classes: entry.classes,
        language_hint: entry.language_hint,
        priority: 18 + index,
        reason: entry.reason
      });
    });
  }

  if (sourceTargets.includes("archive")) {
    variants.push(
      { query: `${topic} Library of Congress`, intent: "archive", source_classes: ["archive"], priority: 22, reason: "LOC-targeted archive branch" },
      { query: `${topic} Internet Archive`, intent: "archive", source_classes: ["archive", "academic_context"], priority: 23, reason: "Internet Archive targeted branch" },
      { query: `${topic} Europeana`, intent: "museum", source_classes: ["museum", "archive"], priority: 24, reason: "Europeana cultural-heritage branch" },
      { query: `${topic} museum open access`, intent: "museum", source_classes: ["museum", "open_media"], priority: 25, reason: "museum/open-access provider pack branch" },
      { query: `${topic} digital collection`, intent: "museum", source_classes: ["museum", "archive"], priority: 26, reason: "digital collection branch" },
      { query: `${topic} national archives`, intent: "archive", source_classes: ["archive", "academic_context"], priority: 27, reason: "national archive branch" }
    );
  }

  if (sourceTargets.includes("commons")) {
    variants.push(
      { query: `${topic} Wikimedia Commons`, intent: "public_domain", source_classes: ["open_media"], priority: 28, reason: "Commons-targeted branch" },
      { query: `${topic} Creative Commons`, intent: "public_domain", source_classes: ["open_media"], priority: 29, reason: "open-license branch" }
    );
  }

  if (/space|nasa|satellite|moon|mars|earth|apollo|rocket|aerospace/i.test(topic) || mode === "academic_source_pack") {
    variants.push({ query: `${topic} NASA images`, intent: "science", source_classes: ["science", "archive"], priority: 16, reason: "science/public-agency branch" });
  }

  return uniqueVariants(variants).map((variant, index) => ({
    ...variant,
    id: variantId(index),
    provider_targets: providersForClasses(variant.source_classes, sourceTargets)
  }));
}

function buildProviderRouting(variants: QueryVariant[], depth: ResearchRequest["depth"]): Partial<Record<SearchProviderName, ProviderRoutingPlanEntry>> {
  const entries: Partial<Record<SearchProviderName, ProviderRoutingPlanEntry>> = {};

  for (const provider of Object.keys(providerClassMap) as SearchProviderName[]) {
    const providerClasses = providerClassMap[provider];
    const routed = variants.filter((variant) => variant.provider_targets.includes(provider));
    const maxQueries = providerMaxQueries[provider][depth];
    const selected = routed.slice(0, maxQueries);
    entries[provider] = {
      provider,
      source_classes: providerClasses,
      query_ids: selected.map((variant) => variant.id),
      queries: selected.map((variant) => variant.query),
      max_queries: maxQueries,
      routing_reason: `Routed ${selected.length}/${routed.length} query variants to ${provider} using source-class match.`
    };
  }

  return entries;
}

function incrementCount<T extends string>(record: Partial<Record<T, number>>, key: T): void {
  record[key] = (record[key] ?? 0) + 1;
}

function buildRoutingTrace(params: {
  topic: string;
  mode: ResearchRequest["mode"];
  depth: ResearchRequest["depth"];
  variants: QueryVariant[];
  providerRouting: Partial<Record<SearchProviderName, ProviderRoutingPlanEntry>>;
}): SourceClassRoutingTrace {
  const sourceClassCounts: Partial<Record<SourceClass, number>> = {};
  const intentCounts: Partial<Record<QueryIntent, number>> = {};
  const providerQueryCounts: Partial<Record<SearchProviderName, number>> = {};
  const providerSourceClasses: Partial<Record<SearchProviderName, SourceClass[]>> = {};

  for (const variant of params.variants) {
    incrementCount(intentCounts, variant.intent);
    for (const sourceClass of variant.source_classes) incrementCount(sourceClassCounts, sourceClass);
  }

  for (const [provider, route] of Object.entries(params.providerRouting) as Array<[SearchProviderName, ProviderRoutingPlanEntry]>) {
    providerQueryCounts[provider] = route.queries.length;
    providerSourceClasses[provider] = route.source_classes;
  }

  const warnings: string[] = [];
  if (params.variants.length < 5) warnings.push("Query expansion produced fewer than five variants; retrieval may be narrow.");
  if ((providerQueryCounts.loc ?? 0) === 0 && (sourceClassCounts.archive ?? 0) > 0) warnings.push("Archive query variants exist but LOC received no routed queries.");
  if ((providerQueryCounts.wikimedia ?? 0) === 0 && (sourceClassCounts.open_media ?? 0) > 0) warnings.push("Open-media query variants exist but Wikimedia received no routed queries.");

  return {
    schema_version: "0.3.0",
    original_topic: params.topic,
    mode: params.mode,
    depth: params.depth,
    query_variant_count: params.variants.length,
    routed_provider_count: Object.values(params.providerRouting).filter((route) => route.queries.length > 0).length,
    source_class_counts: sourceClassCounts,
    intent_counts: intentCounts,
    provider_query_counts: providerQueryCounts,
    provider_source_classes: providerSourceClasses,
    reference_launcher_count: 9,
    warnings
  };
}

export function createSearchPlan(request: ResearchRequest): SearchPlan {
  const topic = request.topic.trim();
  const sourceTargets = sourceTargetsForMode(request.mode);
  const variants = createQueryVariants(topic, request.mode, sourceTargets).slice(0, depthVariantCounts[request.depth]);
  const providerRouting = buildProviderRouting(variants, request.depth);
  const routingTrace = buildRoutingTrace({ topic, mode: request.mode, depth: request.depth, variants, providerRouting });

  return {
    original_topic: topic,
    mode: request.mode,
    depth: request.depth,
    queries: variants.map((variant) => variant.query),
    source_targets: sourceTargets,
    query_variants: variants,
    provider_routing: providerRouting,
    source_class_routing: routingTrace
  };
}
