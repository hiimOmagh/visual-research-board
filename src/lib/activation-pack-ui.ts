
import type { BroadReferenceResult } from "@/types/broad-reference-result";
import type {
  ActivationPackUiInput,
  ActivationPackUiModel,
  ActivationPackUiMode
} from "@/types/activation-pack-ui";
import { createReferenceActivationPack } from "@/lib/reference-activation-pack";

export function createActivationPackUiModel(input: ActivationPackUiInput): ActivationPackUiModel {
  const selectedResults = selectActivationResults(input.results, input.selected_result_ids);
  const mode = resolveActivationPackUiMode(input.mode, input.results, selectedResults);

  if (selectedResults.length === 0) {
    return {
      mode,
      pack: null,
      selected_results: [],
      available_count: input.results.length,
      empty_state: createActivationPackEmptyState(input.results.length),
      primary_action_label: "Add references before activation",
      guidance_notes: createActivationPackGuidanceNotes([])
    };
  }

  const pack = createReferenceActivationPack({
    title: input.title,
    query: input.query,
    pack_type: input.pack_type ?? "research_brief",
    results: selectedResults
  });

  return {
    mode,
    pack,
    selected_results: selectedResults,
    available_count: input.results.length,
    empty_state: null,
    primary_action_label: "Review activation pack",
    guidance_notes: createActivationPackGuidanceNotes(selectedResults)
  };
}

export function selectActivationResults(
  results: BroadReferenceResult[],
  selectedResultIds?: string[]
): BroadReferenceResult[] {
  if (!selectedResultIds || selectedResultIds.length === 0) {
    return results;
  }

  const selected = new Set(selectedResultIds);
  return results.filter((result) => selected.has(result.id));
}

export function resolveActivationPackUiMode(
  preferredMode: ActivationPackUiMode | undefined,
  allResults: BroadReferenceResult[],
  selectedResults: BroadReferenceResult[]
): ActivationPackUiMode {
  if (preferredMode) return preferredMode;
  if (allResults.length === 0) return "empty";
  if (selectedResults.length !== allResults.length) return "selected";
  return "board";
}

export function createActivationPackEmptyState(totalResults: number): string {
  if (totalResults === 0) {
    return "No gathered references are available yet. Run discovery or add board references before activation.";
  }

  return "No selected references are available for this activation pack. Adjust selection or use the full board.";
}

export function createActivationPackGuidanceNotes(results: BroadReferenceResult[]): string[] {
  if (results.length === 0) {
    return [
      "Activation packs are built from already-gathered references.",
      "No scraping, image generation, copyrighted text extraction, paywall bypass, or export expansion is performed."
    ];
  }

  const notes = [
    "Review source roles before using the pack for production.",
    "Check rights/access notes before publication, reuse, or generation workflows.",
    "Activation packs organize metadata and brief text only."
  ];

  if (results.some((result) => result.source_class === "social_media")) {
    notes.push("Social references require platform-restriction review.");
  }

  if (results.some((result) => result.source_class === "book")) {
    notes.push("Book references should keep bibliography and page/chapter notes metadata-first.");
  }

  if (results.some((result) => result.risk_level === "high" || result.risk_level === "unknown")) {
    notes.push("High or unknown risk references need explicit review before activation.");
  }

  return notes;
}
