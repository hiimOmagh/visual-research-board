import type { SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { domainFromUrl, fetchJsonWithTimeout, providerQuerySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";
import { readServerProviderKey } from "@/lib/provider-key-security";

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
}

interface TavilyImageObject {
  url?: string;
  description?: string;
}

interface TavilyResponse {
  results?: TavilyResult[];
  images?: Array<string | TavilyImageObject>;
}

function imageUrlFromTavilyImage(image: string | TavilyImageObject): string {
  return typeof image === "string" ? image : image.url ?? "";
}

function imageDescriptionFromTavilyImage(image: string | TavilyImageObject): string | undefined {
  return typeof image === "string" ? undefined : stripHtml(image.description);
}

export async function searchTavily(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = readServerProviderKey("TAVILY_API_KEY");
  if (!apiKey || !plan.source_targets.includes("web")) return [];

  const maxResults = plan.depth === "quick" ? 5 : plan.depth === "standard" ? 8 : 10;
  const queries = providerQuerySlice(plan, "tavily");
  const tasks = queries.map((query, queryIndex) => async () => {
    const data = await fetchJsonWithTimeout<TavilyResponse>(
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
          include_images: plan.source_targets.includes("image")
        })
      },
      8000
    );

    const webResults = (data?.results ?? []).map((item, index) => ({
      id: `tavily_web_${queryIndex}_${index}`,
      type: "web",
      title: stripHtml(item.title) || plan.original_topic,
      description: stripHtml(item.content),
      source_url: item.url ?? "",
      source_domain: item.url ? domainFromUrl(item.url) : "unknown-source",
      provider: "tavily",
      license_detected: "unknown",
      license_confidence: 0.12,
      tags: ["tavily", "web-source", "broad-web-candidate", `query-${queryIndex + 1}`]
    } satisfies RawProviderResult)).filter((item) => item.source_url);

    const imageResults = (data?.images ?? []).map((image, index) => {
      const imageUrl = imageUrlFromTavilyImage(image);
      return {
        id: `tavily_image_${queryIndex}_${index}`,
        type: "image",
        title: imageDescriptionFromTavilyImage(image) || `${plan.original_topic} visual reference`,
        description: imageDescriptionFromTavilyImage(image),
        thumbnail_url: imageUrl,
        image_url: imageUrl,
        source_url: imageUrl,
        source_domain: imageUrl ? domainFromUrl(imageUrl) : "unknown-source",
        provider: "tavily",
        license_detected: "unknown",
        license_confidence: 0.1,
        tags: ["tavily-image", "broad-web-image-candidate", "license-check-needed", `query-${queryIndex + 1}`]
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);

    return [...webResults, ...imageResults];
  });

  const batches = await runLimited(tasks, 3);
  return batches.flat();
}
