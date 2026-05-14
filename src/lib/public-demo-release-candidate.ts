export const PUBLIC_DEMO_RELEASE_CANDIDATE = {
  appVersion: "2.0.3",
  releaseName: "Public Demo Release Candidate",
  releaseLabel: "v2.0.3 — Public Demo Release Candidate",
  mode: "demo-safe",
  liveScraping: false,
  productionOAuth: false,
  privateCredentialRequired: false,
  manualWorkflowFirstClass: true,
  limitations: [
    "Demo workflows are safe to inspect without private credentials.",
    "Provider keys are optional and must remain server-only.",
    "Unavailable providers must be shown as unavailable, skipped, or disabled.",
    "Attribution and rights labels are assistance layers, not legal clearance.",
    "Exports are evidence and review packages, not source-verification guarantees."
  ],
  requiredChecks: [
    "npm run public-demo:check",
    "npm run qa:public-demo",
    "npm run security:key:check",
    "npm run qa"
  ]
} as const;

export type PublicDemoReleaseCandidate = typeof PUBLIC_DEMO_RELEASE_CANDIDATE;

export function getPublicDemoReleaseCandidateStatus() {
  return {
    ...PUBLIC_DEMO_RELEASE_CANDIDATE,
    readyForPublicInspection:
      PUBLIC_DEMO_RELEASE_CANDIDATE.liveScraping === false &&
      PUBLIC_DEMO_RELEASE_CANDIDATE.productionOAuth === false &&
      PUBLIC_DEMO_RELEASE_CANDIDATE.privateCredentialRequired === false &&
      PUBLIC_DEMO_RELEASE_CANDIDATE.manualWorkflowFirstClass === true
  };
}
