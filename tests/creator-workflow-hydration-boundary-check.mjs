import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const wrapperPath = path.join(root, "src/components/search/CreatorWorkflowHydrationBoundary.tsx");
const srcPagePath = path.join(root, "src/app/creator-workflow/page.tsx");
const rootPagePath = path.join(root, "app/creator-workflow/page.tsx");
const packagePath = path.join(root, "package.json");

function read(filePath) {
  assert.ok(fs.existsSync(filePath), `${path.relative(root, filePath)} must exist`);
  return fs.readFileSync(filePath, "utf8");
}

const pkg = JSON.parse(read(packagePath));
assert.equal(pkg.version, "2.4.0", "hydration boundary check must run against v2.4.0");
assert.equal(
  pkg.scripts["creator-workflow:hydration:check"],
  "node tests/creator-workflow-hydration-boundary-check.mjs",
  "package.json must expose the creator workflow hydration check"
);

const wrapper = read(wrapperPath);

assert.match(wrapper, /"use client";/, "hydration boundary must be a client component");
assert.match(wrapper, /useState\(false\)/, "hydration boundary must begin with a stable pre-mounted state");
assert.match(wrapper, /useEffect\s*\(/, "hydration boundary must switch only after client mount");
assert.match(wrapper, /setHasMounted\(true\)/, "hydration boundary must enable the workflow after mount");
assert.match(
  wrapper,
  /creator-workflow-hydration-loading/,
  "hydration boundary must expose a stable loading shell"
);
assert.match(
  wrapper,
  /data-hydration-boundary="client-mounted"/,
  "hydration boundary must mark the client-mounted strategy"
);
assert.match(
  wrapper,
  /return <CreatorWorkflowPanel \/>/,
  "hydration boundary must render CreatorWorkflowPanel after mount"
);

const srcPage = read(srcPagePath);
assert.match(
  srcPage,
  /CreatorWorkflowHydrationBoundary/,
  "src/app creator workflow route must render the hydration boundary"
);
assert.doesNotMatch(
  srcPage,
  /CreatorWorkflowPanel/,
  "src/app creator workflow route must not import CreatorWorkflowPanel directly"
);

if (fs.existsSync(rootPagePath)) {
  const rootPage = read(rootPagePath);
  assert.match(
    rootPage,
    /CreatorWorkflowHydrationBoundary/,
    "root app creator workflow route must render the hydration boundary"
  );
  assert.doesNotMatch(
    rootPage,
    /CreatorWorkflowPanel/,
    "root app creator workflow route must not import CreatorWorkflowPanel directly"
  );
}

console.log("Creator workflow hydration boundary checks passed for v2.4.0.");
