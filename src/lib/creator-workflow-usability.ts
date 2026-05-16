export const CREATOR_WORKFLOW_USABILITY_VERSION = "2.3.0";

export const creatorWorkflowUsabilityContract = {
  schema_version: "2.3.0",
  app_version: "2.3.0",
  release: "v2.3.0",
  capability: "Creator Workflow Usability Depth Pass",
  local_first: true,
  paid_api_required: false,
  live_scraping_required: false,
  fake_live_claims_allowed: false,
  required_loop: [
    "Project Brief",
    "Query Plan Preview",
    "Discovery Results",
    "Review Actions",
    "Saved Board Sections",
    "Evidence Pack Export Preview",
    "Next Step Guidance",
  ],
} as const;

export const creatorWorkflowUsabilityBoardSections = [
  "Primary Visual References",
  "Historical / Source Evidence",
  "Style / Mood References",
  "Rejected / Weak References",
  "Export Candidates",
] as const;

export const creatorWorkflowUsabilityReviewActions = [
  "save to board",
  "reject",
  "mark strong reference",
  "mark weak/uncertain",
  "edit saved reference note",
  "move saved reference section",
  "copy attribution",
  "open source",
] as const;

export const creatorWorkflowUsabilityDepthMarkers = [
  "creator-workflow-usability-depth",
  "brief-to-query-depth",
  "saved-reference-editing",
  "export-preview-coverage",
  "next-step-guidance",
  "local-first fixture/demo mode",
  "Premium documentary thumbnail research: Ancient Carthage and Mediterranean power.",
] as const;
