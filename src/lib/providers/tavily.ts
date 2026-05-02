import type { SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { domainFromUrl, fetchJsonWithTimeout, querySlice, stripHtml } from "@/lib/providers/provider-utils";

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
}

export async function searchTavily(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || !plan.source_targets.includes("web")) return [];

  const maxResults = plan.depth === "quick" ? 4 : plan.depth === "standard" ? 6 : 8;
  const batches = await Promise.all(
    querySlice(plan.queries, plan.depth).map(async (query, queryIndex) => {
      const data = await fetchJsonWithTimeout<{ results?: TavilyResult[] }>(
        "https://api.tavily.com/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            query,
            search_depth: plan.depth === "deep" ? "advanced" : "basic",
            max_results: maxResults,
            include_answer: false,
            include_images: false
          })
        },
        6500
      );

      return (data?.results ?? []).map((item, index) => ({
        id: `tavily_${queryIndex}_${index}`,
        type: "web",
        title: stripHtml(item.title) || plan.original_topic,
        description: stripHtml(item.content),
        source_url: item.url ?? "",
        source_domain: item.url ? domainFromUrl(item.url) : "unknown-source",
        provider: "tavily",
        license_detected: "unknown",
        license_confidence: 0.15,
        tags: ["tavily", "web-source", `query-${queryIndex + 1}`]
      } satisfies RawProviderResult)).filter((item) => item.source_url);
    })
  );

  return batches.flat();
}
