import type { ProviderStatus, SearchDepth, SearchPlan, SearchProviderName } from "@/types/research";

export class ProviderFetchError extends Error {
  status: Extract<ProviderStatus, "error" | "timeout">;
  httpStatus?: number;

  constructor(message: string, status: Extract<ProviderStatus, "error" | "timeout"> = "error", httpStatus?: number) {
    super(message);
    this.name = "ProviderFetchError";
    this.status = status;
    this.httpStatus = httpStatus;
  }
}

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

export async function fetchJsonWithTimeout<T>(url: string, init: RequestInit = {}, timeoutMs = 4500): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new ProviderFetchError(`Provider request failed with HTTP ${response.status}.`, "error", response.status);
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ProviderFetchError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new ProviderFetchError(`Provider request timed out after ${timeoutMs} ms.`, "timeout");
    if (error instanceof Error) throw new ProviderFetchError(error.message || "Provider request failed.", "error");
    throw new ProviderFetchError("Provider request failed with an unknown error.", "error");
  } finally {
    clearTimeout(timeout);
  }
}


export async function fetchTextWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 4500): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new ProviderFetchError(`Provider request failed with HTTP ${response.status}.`, "error", response.status);
    return await response.text();
  } catch (error) {
    if (error instanceof ProviderFetchError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new ProviderFetchError(`Provider request timed out after ${timeoutMs} ms.`, "timeout");
    if (error instanceof Error) throw new ProviderFetchError(error.message || "Provider request failed.", "error");
    throw new ProviderFetchError("Provider request failed with an unknown error.", "error");
  } finally {
    clearTimeout(timeout);
  }
}

export function querySlice(queries: string[], depth: SearchDepth): string[] {
  const count = depth === "quick" ? 2 : depth === "standard" ? 5 : 8;
  return queries.slice(0, count);
}

export function providerQuerySlice(plan: SearchPlan, provider: SearchProviderName): string[] {
  const routedQueries = plan.provider_routing?.[provider]?.queries;
  const candidates = routedQueries && routedQueries.length > 0 ? routedQueries : plan.queries;
  return querySlice(candidates, plan.depth);
}

export async function runLimited<T>(tasks: Array<() => Promise<T>>, concurrency = 3): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const current = cursor;
      cursor += 1;
      results[current] = await tasks[current]();
    }
  }

  const workerCount = Math.min(Math.max(concurrency, 1), tasks.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export function stripHtml(value?: string): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
