import type { ResearchMode, ResearchResult, ResultScores } from "@/types/research";
import { classifySourceDomain, sourceGroupWeight, topicRelevanceSignal } from "@/lib/result-quality";

const clamp01 = (value: number): number => Math.max(0, Math.min(1, Number(value.toFixed(2))));

const highRiskDomains = ["reuters", "getty", "apnews", "shutterstock", "alamy", "istockphoto", "adobestock"];

interface ScoreContext {
  topic?: string;
  mode?: ResearchMode;
}

export function scoreResult(
  input: Pick<ResearchResult, "source_domain" | "license_detected" | "type" | "width" | "height" | "tags" | "risk_level" | "license_confidence" | "title" | "description" | "thumbnail_url" | "image_url">,
  context: ScoreContext = {}
): ResultScores {
  const domain = input.source_domain.toLowerCase();
  const sourceGroup = classifySourceDomain(domain);

  const sourceCredibility = (() => {
    const base = sourceGroupWeight(sourceGroup);
    if (highRiskDomains.some((hint) => domain.includes(hint))) return Math.min(base, 0.62);
    return base;
  })();

  const licenseClarity = (() => {
    const confidenceAdjustment = Math.max(-0.12, Math.min(0.08, (input.license_confidence - 0.5) * 0.18));
    if (input.license_detected === "public_domain") return 0.9 + confidenceAdjustment;
    if (input.license_detected === "creative_commons") return 0.78 + confidenceAdjustment;
    if (input.license_detected === "unclear") return 0.38 + confidenceAdjustment;
    if (input.license_detected === "unknown") return 0.24 + confidenceAdjustment;
    return 0.14 + confidenceAdjustment;
  })();

  const visualQuality = (() => {
    if (input.type !== "image") return input.thumbnail_url ? 0.5 : 0.42;
    const width = input.width ?? 0;
    const height = input.height ?? 0;
    const pixels = width * height;
    const aspectRatio = width && height ? width / height : 0;
    const hasUsefulAspectRatio = aspectRatio >= 1.2 && aspectRatio <= 2.2;
    const hasPortraitUtility = aspectRatio >= 0.65 && aspectRatio < 1.2;
    const resolutionScore = (() => {
      if (pixels >= 2_400_000) return 0.94;
      if (pixels >= 1_300_000) return 0.86;
      if (pixels >= 720_000) return 0.75;
      if (pixels >= 250_000) return 0.58;
      return input.thumbnail_url || input.image_url ? 0.46 : 0.34;
    })();
    const aspectBoost = hasUsefulAspectRatio ? 0.06 : hasPortraitUtility ? 0.03 : -0.04;
    return resolutionScore + aspectBoost;
  })();

  const relevance = topicRelevanceSignal({
    topic: context.topic,
    mode: context.mode,
    title: input.title,
    description: input.description,
    tags: input.tags,
    sourceDomain: input.source_domain
  });

  const tagSignal = (() => {
    const tags = input.tags.map((tag) => tag.toLowerCase()).join(" ");
    let signal = 0;
    if (tags.includes("public-domain") || tags.includes("archive") || tags.includes("map")) signal += 0.08;
    if (tags.includes("thumbnail") || tags.includes("composition")) signal += 0.07;
    if (tags.includes("official") || tags.includes("academic")) signal += 0.05;
    return Math.min(signal, 0.12);
  })();

  const riskPenalty = (() => {
    if (input.risk_level === "avoid") return 0.36;
    if (input.risk_level === "high") return 0.25;
    if (input.risk_level === "reference_only") return 0.14;
    if (input.risk_level === "medium") return 0.07;
    return 0;
  })();

  const productionUsefulness = clamp01((visualQuality * 0.34) + (relevance * 0.22) + (sourceCredibility * 0.2) + (licenseClarity * 0.16) + 0.08 + tagSignal - riskPenalty);
  const uniqueness = clamp01(0.58 + (input.license_detected === "public_domain" ? 0.08 : 0) + (input.type === "archive" ? 0.06 : 0) + (sourceGroup === "general_web" ? -0.04 : 0));

  const weights = (() => {
    if (context.mode === "public_domain") return { relevance: 0.2, production: 0.22, source: 0.22, license: 0.26, uniqueness: 0.1 };
    if (context.mode === "thumbnail_inspiration" || context.mode === "design_moodboard") return { relevance: 0.23, production: 0.38, source: 0.14, license: 0.12, uniqueness: 0.13 };
    if (context.mode === "academic_source_pack") return { relevance: 0.28, production: 0.18, source: 0.3, license: 0.12, uniqueness: 0.12 };
    if (context.mode === "news_event") return { relevance: 0.3, production: 0.24, source: 0.24, license: 0.1, uniqueness: 0.12 };
    return { relevance: 0.26, production: 0.3, source: 0.18, license: 0.16, uniqueness: 0.1 };
  })();

  const overall = clamp01((relevance * weights.relevance) + (productionUsefulness * weights.production) + (sourceCredibility * weights.source) + (licenseClarity * weights.license) + (uniqueness * weights.uniqueness));

  return {
    relevance: clamp01(relevance),
    visual_quality: clamp01(visualQuality),
    source_credibility: clamp01(sourceCredibility),
    license_clarity: clamp01(licenseClarity),
    uniqueness,
    production_usefulness: productionUsefulness,
    overall
  };
}
