import type { SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";

interface BraveImageResult {
  title?: string;
  url?: string;
  thumbnail?: { src?: string };
  properties?: { url?: string; width?: number; height?: number };
  source?: string;
}

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
  profile?: { name?: string };
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

export async function searchBraveImages(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return [];

  const query = plan.queries[0];
  const response = await fetch(`https://api.search.brave.com/res/v1/images/search?q=${encodeURIComponent(query)}&count=20`, {
    headers: {
      "X-Subscription-Token": apiKey
    }
  });

  if (!response.ok) return [];
  const data = await response.json() as { results?: BraveImageResult[] };

  return (data.results ?? []).map((item, index) => {
    const sourceUrl = item.url ?? item.properties?.url ?? "";
    return {
      id: `brave_image_${index}`,
      type: "image",
      title: item.title ?? plan.original_topic,
      thumbnail_url: item.thumbnail?.src,
      image_url: item.properties?.url,
      source_url: sourceUrl,
      source_domain: sourceUrl ? domainFromUrl(sourceUrl) : item.source ?? "unknown-source",
      provider: "brave",
      width: item.properties?.width,
      height: item.properties?.height,
      license_detected: "unknown",
      license_confidence: 0.15,
      tags: ["brave-image", "license-check-needed"]
    } satisfies RawProviderResult;
  }).filter((item) => item.source_url);
}

export async function searchBraveWeb(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return [];

  const query = plan.queries[0];
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`, {
    headers: {
      "X-Subscription-Token": apiKey
    }
  });

  if (!response.ok) return [];
  const data = await response.json() as { web?: { results?: BraveWebResult[] } };

  return (data.web?.results ?? []).map((item, index) => ({
    id: `brave_web_${index}`,
    type: "web",
    title: item.title ?? plan.original_topic,
    description: item.description,
    source_url: item.url ?? "",
    source_domain: item.url ? domainFromUrl(item.url) : item.profile?.name ?? "unknown-source",
    provider: "brave",
    license_detected: "unknown",
    license_confidence: 0.15,
    tags: ["brave-web", "source-link"]
  } satisfies RawProviderResult)).filter((item) => item.source_url);
}
