import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { fetchJsonWithTimeout, querySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";

interface ArchiveDoc {
  identifier?: string;
  title?: string;
  description?: string;
  mediatype?: string;
  date?: string;
}

function rowsForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 8;
  if (depth === "standard") return 14;
  return 24;
}

function archiveQuery(query: string): string {
  const escaped = query.replace(/"/g, "");
  return `(${escaped}) AND (mediatype:image OR mediatype:texts OR mediatype:movies) AND -collection:opensource_audio`;
}

async function searchArchiveQuery(query: string, queryIndex: number, plan: SearchPlan): Promise<RawProviderResult[]> {
  const url = new URL("https://archive.org/advancedsearch.php");
  url.searchParams.set("q", archiveQuery(query));
  for (const field of ["identifier", "title", "description", "mediatype", "date"]) url.searchParams.append("fl[]", field);
  url.searchParams.set("rows", String(rowsForDepth(plan.depth)));
  url.searchParams.set("page", "1");
  url.searchParams.set("output", "json");

  const data = await fetchJsonWithTimeout<{ response?: { docs?: ArchiveDoc[] } }>(url.toString(), {}, 8000);
  return (data?.response?.docs ?? []).map((item, index) => {
    const id = item.identifier ?? "";
    const thumb = id ? `https://archive.org/services/img/${encodeURIComponent(id)}` : undefined;
    return {
      id: `internet_archive_${queryIndex}_${id || index}`,
      type: item.mediatype === "image" ? "image" : "archive",
      title: stripHtml(item.title) || `${plan.original_topic} Internet Archive item`,
      description: stripHtml(item.description).slice(0, 260) || item.date,
      thumbnail_url: thumb,
      image_url: thumb,
      source_url: id ? `https://archive.org/details/${encodeURIComponent(id)}` : "",
      source_domain: "archive.org",
      provider: "internet_archive",
      license_detected: "unclear",
      license_confidence: 0.42,
      source_access_mode: "archive_open_access",
      rights_status: "check_required",
      reuse_risk: "medium",
      tags: ["internet-archive", "archive-open-access", "metadata-search", `query-${queryIndex + 1}`]
    } satisfies RawProviderResult;
  }).filter((item) => item.source_url);
}

export async function searchInternetArchive(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!plan.source_targets.includes("archive") && !plan.source_targets.includes("image")) return [];
  const tasks = querySlice(plan.queries, plan.depth).map((query, queryIndex) => () => searchArchiveQuery(query, queryIndex, plan));
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}
