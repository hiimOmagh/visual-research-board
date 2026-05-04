import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { fetchJsonWithTimeout, providerQuerySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";

interface LocResult {
  title?: string;
  url?: string;
  image_url?: string[];
  date?: string;
  description?: string | string[];
  subject?: string[];
}

function limitForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 10;
  if (depth === "standard") return 18;
  return 28;
}

function descriptionText(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return stripHtml(value.join(" ")).slice(0, 260) || undefined;
  return stripHtml(value).slice(0, 260) || undefined;
}

async function searchLocQuery(query: string, queryIndex: number, plan: SearchPlan): Promise<RawProviderResult[]> {
  const url = new URL("https://www.loc.gov/search/");
  url.searchParams.set("fo", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("fa", "online-format:image");
  url.searchParams.set("c", String(limitForDepth(plan.depth)));

  const data = await fetchJsonWithTimeout<{ results?: LocResult[] }>(url.toString(), {}, 7500);
  return (data?.results ?? []).map((item, index) => {
    const thumb = item.image_url?.[0];
    return {
      id: `loc_${queryIndex}_${index}`,
      type: thumb ? "image" : "archive",
      title: stripHtml(item.title) || `${plan.original_topic} Library of Congress record`,
      description: descriptionText(item.description) ?? item.date,
      thumbnail_url: thumb,
      image_url: thumb,
      source_url: item.url ?? "",
      source_domain: "loc.gov",
      provider: "loc",
      license_detected: "unclear",
      license_confidence: 0.48,
      source_access_mode: "backend_free_no_key",
      rights_status: "check_required",
      reuse_risk: "medium",
      tags: ["library-of-congress", "archive-open-access", "rights-check-required", ...(item.subject ?? []).slice(0, 4), `query-${queryIndex + 1}`]
    } satisfies RawProviderResult;
  }).filter((item) => item.source_url);
}

export async function searchLibraryOfCongress(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!plan.source_targets.includes("archive") && !plan.source_targets.includes("image")) return [];
  const tasks = providerQuerySlice(plan, "loc").map((query, queryIndex) => () => searchLocQuery(query, queryIndex, plan));
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}
