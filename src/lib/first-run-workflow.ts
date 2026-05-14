
export type FirstRunWorkflowStep = {
  id: "search" | "save" | "review" | "activate" | "export";
  title: string;
  action: string;
  outcome: string;
  guardrail: string;
};

export const FIRST_RUN_WORKFLOW_VERSION = "v2.1.5";

export const firstRunWorkflowSteps: FirstRunWorkflowStep[] = [
  {
    id: "search",
    title: "Search broadly",
    action: "Start with a topic, visual style, person, place, object, book, or source class.",
    outcome: "The app returns references that can become research, design, or production inputs.",
    guardrail: "Search results are discovery leads, not automatic legal clearance."
  },
  {
    id: "save",
    title: "Save useful references",
    action: "Move promising references into the project board instead of treating every result as equal.",
    outcome: "The board becomes the working set for the project.",
    guardrail: "Do not rehost source media or imply ownership of external material."
  },
  {
    id: "review",
    title: "Review evidence and risk",
    action: "Use source class, access notes, bias/coverage notes, and reference role labels to decide what is useful.",
    outcome: "Weak, risky, duplicate, or low-context references are easier to spot.",
    guardrail: "The app supports judgment; it does not replace rights review or source verification."
  },
  {
    id: "activate",
    title: "Build an activation pack",
    action: "Turn selected references into structured creative/research prompts, notes, and production guidance.",
    outcome: "The reference set becomes usable for planning, prompting, scripting, or design direction.",
    guardrail: "Activation means interpretation and organization, not copying protected works."
  },
  {
    id: "export",
    title: "Export the pack",
    action: "Preview and export Markdown/JSON evidence packs for downstream work.",
    outcome: "The user leaves with structured metadata, source-aware notes, and next actions.",
    guardrail: "Exports preserve boundaries and should not claim automatic clearance."
  }
];

export const firstRunValueProposition =
  "Turn messy reference discovery into a structured, source-aware creative/research pack.";

export const firstRunPrimaryNextAction =
  "Start with one broad search, save three useful references, then build an activation pack.";

export const firstRunEmptyStateGuidance = [
  "Try a broad visual or research query.",
  "Use multiple source classes when the first result set is narrow.",
  "Save only references that add evidence, style direction, context, or production utility.",
  "Use the activation pack after the board has a focused working set."
];

export const firstRunBoundaryCopy = [
  "No automatic rights clearance.",
  "No private/account-gated scraping.",
  "No paywall bypass.",
  "No source media rehosting.",
  "No claim that every result is verified."
];
