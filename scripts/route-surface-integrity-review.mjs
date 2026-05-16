import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const pkg = JSON.parse(read("package.json"));

const expectedRoutes = [
  {
    route: "/",
    files: ["app/page.tsx", "src/app/page.tsx"],
    purpose: "Landing page and product entry point",
  },
  {
    route: "/creator-workflow",
    files: ["app/creator-workflow/page.tsx", "src/app/creator-workflow/page.tsx"],
    purpose: "End-to-end creator research workflow",
  },
  {
    route: "/api/search",
    files: ["app/api/search/route.ts", "src/app/api/search/route.ts"],
    purpose: "local-first search endpoint with transparent fixture/provider mode",
  },
  {
    route: "/api/export",
    files: ["app/api/export/route.ts", "src/app/api/export/route.ts"],
    purpose: "Evidence pack export endpoint",
  },
  {
    route: "/api/metadata",
    files: ["app/api/metadata/route.ts", "src/app/api/metadata/route.ts"],
    purpose: "Metadata helper endpoint",
  },
  {
    route: "/api/provider-runtime",
    files: ["app/api/provider-runtime/route.ts", "src/app/api/provider-runtime/route.ts"],
    purpose: "Provider runtime status endpoint",
  },
];

const route_surface = expectedRoutes.map((entry) => {
  const presentFiles = entry.files.filter((file) => existsSync(join(root, file)));

  return {
    route: entry.route,
    purpose: entry.purpose,
    present: presentFiles.length > 0,
    files: presentFiles,
  };
});

const report = {
  schema_version: pkg.version,
  app_version: pkg.version,
  workflow: "route-surface-integrity",
  status: route_surface.every((entry) => entry.present) ? "review-recorded" : "route-surface-incomplete",
  generated_at: new Date().toISOString(),
  route_surface,
  landing_integration: {
    requires_creator_workflow_link: true,
    requires_api_surface_visibility: true,
    requires_local_first_disclosure: true,
  },
  non_goals: [
    "No packaging work",
    "No release archive gate",
    "No OAuth",
    "No paid API requirement",
    "No live scraping",
  ],
};

mkdirSync(join(root, "artifacts"), { recursive: true });
writeFileSync(
  join(root, "artifacts", "route-surface-integrity-review.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`Route surface integrity review artifact written for v${pkg.version}.`);
console.log(`Status: ${report.status}`);
