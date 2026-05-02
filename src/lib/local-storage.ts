import type { ResearchResult } from "@/types/research";

const STORAGE_KEY = "visual-research-board:saved-results:v0.1.0-alpha.3";
const LEGACY_KEYS = [
  "visual-research-board:saved-results:v0.1.0-alpha.2",
  "visual-research-board:saved-results:v0.1.0-alpha.1"
];

function parseSavedResults(raw: string | null): ResearchResult[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ResearchResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadSavedResults(): ResearchResult[] {
  if (typeof window === "undefined") return [];

  const current = parseSavedResults(window.localStorage.getItem(STORAGE_KEY));
  if (current.length > 0) return current;

  for (const legacyKey of LEGACY_KEYS) {
    const legacy = parseSavedResults(window.localStorage.getItem(legacyKey));
    if (legacy.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
      return legacy;
    }
  }

  return [];
}

export function persistSavedResults(results: ResearchResult[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}
