import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { fetchJsonWithTimeout, providerQuerySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";
import { readServerProviderKey } from "@/lib/provider-key-security";

interface EuropeanaItem {
  id?: string;
  title?: string[];
  dcDescription?: string[];
  edmPreview?: string[];
  edmIsShownAt?: string[];
  edmIsShownBy?: string[];
  rights?: string[];
  dataProvider?: string[];
}

function rowsForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 8;
  if (depth === "standard") return 16;
  return 24;
}

function licenseFromRights(rights?: string[]): Pick<RawProviderResult, "license_detected" | "license_confidence" | "rights_status" | "reuse_risk" | "license_url"> {
  const value = (rights?.[0] ?? "").toLowerCase();
  if (value.includes("publicdomain") || value.includes("creativecommons.org/publicdomain") || value.includes("zero/1.0")) {
    return { license_detected: "public_domain", license_confidence: 0.8, rights_status: "public_domain", reuse_risk: "low", license_url: rights?.[0] };
  }
  if (value.includes("creativecommons.org/licenses")) {
    return { license_detected: "creative_commons", license_confidence: 0.76, rights_status: "open_license", reuse_risk: "medium", license_url: rights?.[0] };
  }
  return { license_detected: "unclear", license_confidence: 0.46, rights_status: "check_required", reuse_risk: "medium", license_url: rights?.[0] };
}

async function searchEuropeanaQuery(query: string, queryIndex: number, plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = readServerProviderKey("EUROPEANA_API_KEY");
  if (!apiKey) return [];
  const url = new URL("https://api.europeana.eu/record/v2/search.json");
  url.searchParams.set("wskey", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("media", "true");
  url.searchParams.set("rows", String(rowsForDepth(plan.depth)));

  const data = await fetchJsonWithTimeout<{ items?: EuropeanaItem[] }>(url.toString(), {}, 8000);
  return (data?.items ?? []).map((item, index) => {
    const license = licenseFromRights(item.rights);
    return {
      id: `europeana_${queryIndex}_${item.id?.replace(/\W+/g, "_") ?? index}`,
      type: "image",
      title: stripHtml(item.title?.[0]) || `${plan.original_topic} Europeana record`,
      description: stripHtml(item.dcDescription?.[0]).slice(0, 260) || item.dataProvider?.[0],
      thumbnail_url: item.edmPreview?.[0] ?? item.edmIsShownBy?.[0],
      image_url: item.edmIsShownBy?.[0] ?? item.edmPreview?.[0],
      source_url: item.edmIsShownAt?.[0] ?? (item.id ? `https://www.europeana.eu/item${item.id}` : ""),
      source_domain: "europeana.eu",
      provider: "europeana",
      source_access_mode: "backend_free_key_required",
      tags: ["europeana", "cultural-heritage", "free-key-provider", `query-${queryIndex + 1}`],
      ...license
    } satisfies RawProviderResult;
  }).filter((item) => item.source_url);
}

export async function searchEuropeana(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!plan.source_targets.includes("archive") && !plan.source_targets.includes("image")) return [];
  const tasks = providerQuerySlice(plan, "europeana").map((query, queryIndex) => () => searchEuropeanaQuery(query, queryIndex, plan));
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}
