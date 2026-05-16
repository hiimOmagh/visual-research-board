import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (path) => readFileSync(join(root, path), "utf8");
const exists = (path) => existsSync(join(root, path));
const fileText = (candidates) =>
  candidates
    .filter((candidate) => exists(candidate))
    .map((candidate) => read(candidate))
    .join("\n");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.4.0", "package.json version must be 2.4.0");
assert(pkg.scripts?.["route-surface:check"] === "node tests/route-surface-integrity-check.mjs", "package.json must expose route-surface:check");
assert(pkg.scripts?.["route-surface:review"] === "node scripts/route-surface-integrity-review.mjs", "package.json must expose route-surface:review");

const fullQa = read("scripts/full-qa-gate.mjs");
assert(fullQa.includes("route-surface-integrity"), "full QA gate must include route-surface-integrity");

const reviewScript = read("scripts/route-surface-integrity-review.mjs");
for (const token of ["route-surface-integrity", "local-first", "No packaging work", "/api/search", "/creator-workflow"]) {
  assert(reviewScript.includes(token), `route surface review script must include ${token}`);
}

const expectedRoutes = [
  {
    route: "/",
    files: ["app/page.tsx", "src/app/page.tsx"],
  },
  {
    route: "/creator-workflow",
    files: ["app/creator-workflow/page.tsx", "src/app/creator-workflow/page.tsx"],
  },
  {
    route: "/api/search",
    files: ["app/api/search/route.ts", "src/app/api/search/route.ts"],
  },
  {
    route: "/api/export",
    files: ["app/api/export/route.ts", "src/app/api/export/route.ts"],
  },
  {
    route: "/api/metadata",
    files: ["app/api/metadata/route.ts", "src/app/api/metadata/route.ts"],
  },
  {
    route: "/api/provider-runtime",
    files: ["app/api/provider-runtime/route.ts", "src/app/api/provider-runtime/route.ts"],
  },
];

for (const entry of expectedRoutes) {
  assert(entry.files.some((file) => exists(file)), `route surface must include ${entry.route}`);
}

const landing = fileText(["app/page.tsx", "src/app/page.tsx"]);
for (const token of [
  "Visual Research Board",
  "Route Surface Integrity",
  "Creator Workflow",
  "/creator-workflow",
  "/api/search",
  "/api/export",
  "/api/metadata",
  "/api/provider-runtime",
  "local-first",
  "fixture/demo mode",
]) {
  assert(landing.includes(token), `landing page must expose ${token}`);
}

const creatorPage = fileText(["app/creator-workflow/page.tsx", "src/app/creator-workflow/page.tsx"]);
assert(creatorPage.includes("CreatorWorkflowPanel"), "creator workflow route must render CreatorWorkflowPanel");

for (const apiRoute of ["/api/search", "/api/export", "/api/metadata", "/api/provider-runtime"]) {
  const files = expectedRoutes.find((entry) => entry.route === apiRoute)?.files ?? [];
  const routeText = fileText(files);
  assert(routeText.includes("NextResponse") || routeText.includes("Response"), `${apiRoute} must expose a route handler response`);
}

if (failures.length) {
  console.error("Route Surface Integrity + Creator Workflow Landing checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Route Surface Integrity + Creator Workflow Landing checks passed for v2.4.0.");
