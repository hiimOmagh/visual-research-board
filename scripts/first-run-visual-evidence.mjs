import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactsDir = path.join(root, "artifacts");
const screenshotDir = path.join(artifactsDir, "first-run-screenshots");
const reportPath = path.join(artifactsDir, "first-run-visual-evidence.json");

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = packageJson.version;

const expectedScreenshots = [
  {
    id: "desktop-first-run",
    viewport: "1440x1200",
    path: "artifacts/first-run-screenshots/desktop-first-run.png",
    required_checks: [
      "first-run panel visible",
      "primary search action visible",
      "provider/source controls reachable",
      "no horizontal overflow",
      "boundary copy visible or discoverable"
    ]
  },
  {
    id: "tablet-first-run",
    viewport: "1024x1200",
    path: "artifacts/first-run-screenshots/tablet-first-run.png",
    required_checks: [
      "first-run panel readable",
      "workflow steps do not collapse into unreadable columns",
      "activation pack language visible or reachable",
      "no card overlap"
    ]
  },
  {
    id: "mobile-first-run",
    viewport: "390x1200",
    path: "artifacts/first-run-screenshots/mobile-first-run.png",
    required_checks: [
      "first-run panel visible",
      "primary search action not hidden by panel",
      "cards stack vertically",
      "no clipped text",
      "no horizontal overflow"
    ]
  }
];

const screenshots = expectedScreenshots.map((item) => {
  const absolutePath = path.join(root, item.path);
  const exists = fs.existsSync(absolutePath);
  return {
    ...item,
    exists,
    size_bytes: exists ? fs.statSync(absolutePath).size : 0
  };
});

const report = {
  schema_version: "first-run.visual-evidence.v1",
  app_version: version,
  release: "v2.2.0",
  generated_at: new Date().toISOString(),
  status: screenshots.every((item) => item.exists) ? "screenshots-present" : "planned",
  screenshot_directory: path.relative(root, screenshotDir),
  screenshots,
  manual_review_required: true,
  review_summary: {
    desktop: "pending",
    tablet: "pending",
    mobile: "pending",
    blocking_issues: []
  },
  boundaries: [
    "No automatic rights clearance.",
    "No private/account-gated scraping.",
    "No paywall bypass.",
    "No source media rehosting.",
    "No claim that every result is verified."
  ],
  notes: [
    "This script records screenshot evidence expectations and detected files.",
    "It does not add a screenshot/browser dependency.",
    "Screenshots can be captured manually or by an existing browser QA workflow."
  ]
};

fs.mkdirSync(artifactsDir, { recursive: true });
fs.mkdirSync(screenshotDir, { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`First-run visual evidence report written: ${path.relative(root, reportPath)}`);
console.log(`Status: ${report.status}`);
