import type { SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

export async function searchTavily(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query: plan.queries[0],
      search_depth: plan.depth === "deep" ? "advanced" : "basic",
      max_results: plan.depth === "quick" ? 5 : 10
    })
  });

  if (!response.ok) return [];
  const data = await response.json() as { results?: TavilyResult[] };

  return (data.results ?? []).map((item, index) => ({
    id: `tavily_${index}`,
    type: "web",
    title: item.title ?? plan.original_topic,
    description: item.content,
    source_url: item.url ?? "",
    source_domain: item.url ? domainFromUrl(item.url) : "unknown-source",
    provider: "tavily",
    license_detected: "unknown",
    license_confidence: 0.15,
    tags: ["tavily", "web-source"]
  } satisfies RawProviderResult)).filter((item) => item.source_url);
}
