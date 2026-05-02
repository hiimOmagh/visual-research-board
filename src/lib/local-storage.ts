import type { ResearchResult } from "@/types/research";

const STORAGE_KEY = "visual-research-board:saved-results:v0.1.0-alpha.2";

export function loadSavedResults(): ResearchResult[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ResearchResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedResults(results: ResearchResult[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}
