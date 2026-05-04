import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { fetchJsonWithTimeout, querySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";

interface SmithsonianContent {
  title?: string;
  indexedStructured?: { online_media_type?: string[]; date?: string[] };
  content?: {
    descriptiveNonRepeating?: {
      record_link?: string;
      online_media?: { media?: Array<{ thumbnail?: string; content?: string; caption?: string }> };
    };
    freetext?: { notes?: Array<{ content?: string }> };
  };
}

function rowsForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 8;
  if (depth === "standard") return 14;
  return 22;
}

async function searchSmithsonianQuery(query: string, queryIndex: number, plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.SMITHSONIAN_API_KEY;
  if (!apiKey) return [];
  const url = new URL("https://api.si.edu/openaccess/api/v1.0/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("rows", String(rowsForDepth(plan.depth)));
  url.searchParams.set("start", "0");

  const data = await fetchJsonWithTimeout<{ response?: { rows?: SmithsonianContent[] } }>(url.toString(), {}, 8000);
  return (data?.response?.rows ?? []).map((item, index) => {
    const media = item.content?.descriptiveNonRepeating?.online_media?.media?.[0];
    const sourceUrl = item.content?.descriptiveNonRepeating?.record_link ?? "";
    return {
      id: `smithsonian_${queryIndex}_${index}`,
      type: media?.thumbnail || media?.content ? "image" : "archive",
      title: stripHtml(item.title) || `${plan.original_topic} Smithsonian record`,
      description: stripHtml(media?.caption ?? item.content?.freetext?.notes?.[0]?.content).slice(0, 260) || item.indexedStructured?.date?.[0],
      thumbnail_url: media?.thumbnail ?? media?.content,
      image_url: media?.content ?? media?.thumbnail,
      source_url: sourceUrl,
      source_domain: "si.edu",
      provider: "smithsonian",
      license_detected: "public_domain",
      license_confidence: 0.72,
      source_access_mode: "backend_free_key_required",
      rights_status: "public_domain",
      reuse_risk: "low",
      tags: ["smithsonian-open-access", "museum-open-access", "free-key-provider", `query-${queryIndex + 1}`]
    } satisfies RawProviderResult;
  }).filter((item) => item.source_url);
}

export async function searchSmithsonianOpenAccess(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!plan.source_targets.includes("archive") && !plan.source_targets.includes("image") && !plan.source_targets.includes("commons")) return [];
  const tasks = querySlice(plan.queries, plan.depth).map((query, queryIndex) => () => searchSmithsonianQuery(query, queryIndex, plan));
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}
