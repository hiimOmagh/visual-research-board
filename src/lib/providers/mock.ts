import type { SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";

function svgDataUri(label: string, subtitle: string, tone: "low" | "medium" | "high" = "medium"): string {
  const bg = tone === "low" ? "#17261f" : tone === "high" ? "#2b1717" : "#171b2b";
  const accent = tone === "low" ? "#86efac" : tone === "high" ? "#fca5a5" : "#93c5fd";
  const safeLabel = label.replace(/[<>&]/g, "");
  const safeSubtitle = subtitle.replace(/[<>&]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="${bg}"/><circle cx="980" cy="120" r="220" fill="${accent}" opacity="0.16"/><circle cx="150" cy="610" r="180" fill="${accent}" opacity="0.12"/><rect x="72" y="72" width="1064" height="576" rx="42" fill="none" stroke="${accent}" stroke-width="3" opacity="0.55"/><text x="90" y="330" fill="#f8fafc" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">${safeLabel}</text><text x="92" y="392" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="28">${safeSubtitle}</text><text x="92" y="590" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="22">Mock reference card · source preserved</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export async function searchMockProvider(plan: SearchPlan): Promise<RawProviderResult[]> {
  const topic = plan.original_topic;
  const base: RawProviderResult[] = [
    {
      id: "mock_commons_001",
      type: "image",
      title: `${topic} — public-domain style reference`,
      description: "A low-risk candidate-style placeholder representing an archive or Commons result.",
      thumbnail_url: svgDataUri(topic, "Public-domain candidate visual", "low"),
      image_url: svgDataUri(topic, "Public-domain candidate visual", "low"),
      source_url: `https://commons.wikimedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}`,
      source_domain: "commons.wikimedia.org",
      provider: "mock",
      width: 1600,
      height: 900,
      license_detected: "public_domain",
      license_confidence: 0.72,
      tags: ["public-domain-candidate", "archive", "visual-reference"]
    },
    {
      id: "mock_map_002",
      type: "image",
      title: `${topic} — map / explainer reference`,
      description: "A structured placeholder for maps, diagrams, routes, or explainer visuals.",
      thumbnail_url: svgDataUri(topic, "Map / explainer reference", "medium"),
      image_url: svgDataUri(topic, "Map / explainer reference", "medium"),
      source_url: `https://www.loc.gov/search/?q=${encodeURIComponent(topic)}`,
      source_domain: "loc.gov",
      provider: "mock",
      width: 1400,
      height: 840,
      license_detected: "unclear",
      license_confidence: 0.42,
      tags: ["map", "explainer", "source-check-needed"]
    },
    {
      id: "mock_web_003",
      type: "web",
      title: `${topic} — source brief candidate`,
      description: "A web-source placeholder for source context, background, timeline, or analysis.",
      source_url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}`,
      source_domain: "wikipedia.org",
      provider: "mock",
      license_detected: "creative_commons",
      license_confidence: 0.6,
      tags: ["background", "source-link", "context"]
    },
    {
      id: "mock_news_004",
      type: "news",
      title: `${topic} — high-risk media reference`,
      description: "A placeholder representing material that may be useful for reference but risky for direct reuse.",
      thumbnail_url: svgDataUri(topic, "High-risk media reference", "high"),
      image_url: svgDataUri(topic, "High-risk media reference", "high"),
      source_url: `https://www.reuters.com/site-search/?query=${encodeURIComponent(topic)}`,
      source_domain: "reuters.com",
      provider: "mock",
      width: 1200,
      height: 675,
      license_detected: "copyrighted",
      license_confidence: 0.85,
      tags: ["reference-only", "news", "high-risk"]
    },
    {
      id: "mock_mood_005",
      type: "image",
      title: `${topic} — thumbnail composition cue`,
      description: "A visual placeholder for composition, contrast, lighting, and thumbnail direction.",
      thumbnail_url: svgDataUri(topic, "Thumbnail composition cue", "medium"),
      image_url: svgDataUri(topic, "Thumbnail composition cue", "medium"),
      source_url: `https://search.brave.com/images?q=${encodeURIComponent(topic + " thumbnail reference")}`,
      source_domain: "search.brave.com",
      provider: "mock",
      width: 1280,
      height: 720,
      license_detected: "unknown",
      license_confidence: 0.2,
      tags: ["thumbnail", "composition", "reference-only"]
    },
    {
      id: "mock_archive_006",
      type: "archive",
      title: `${topic} — archive search branch`,
      description: "An archive-oriented placeholder that preserves a source-search path.",
      source_url: `https://archive.org/search?query=${encodeURIComponent(topic)}`,
      source_domain: "archive.org",
      provider: "mock",
      license_detected: "unclear",
      license_confidence: 0.38,
      tags: ["archive", "source-discovery", "manual-verification"]
    }
  ];

  const depthLimit = plan.depth === "quick" ? 4 : plan.depth === "standard" ? 6 : base.length;
  return base.slice(0, depthLimit);
}
