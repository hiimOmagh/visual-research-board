import fs from "node:fs";
import path from "node:path";

const pkgPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(pkgPath)) {
  throw new Error("package.json not found. Run this script from the repository root.");
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.version = "0.8.0";
pkg.description = "Public Demo Release Candidate preserving Security and Key Handling for server-only provider keys, redacted diagnostics, demo-safe limitations, and non-misleading provider/runtime presentation.";
pkg.scripts = pkg.scripts || {};

pkg.scripts["public-demo:check"] = pkg.scripts["public-demo:check"] || "node tests/public-demo-release-candidate-check.mjs";
pkg.scripts["qa:public-demo"] = pkg.scripts["qa:public-demo"] || "node scripts/full-qa-gate.mjs --category=public-demo";
pkg.scripts["clean:rc"] = pkg.scripts["clean:rc"] || "node scripts/clean-release-candidate.mjs";
pkg.scripts["security:key:check"] = pkg.scripts["security:key:check"] || "node tests/security-key-handling-check.mjs";
pkg.scripts["qa:security"] = pkg.scripts["qa:security"] || "node scripts/full-qa-gate.mjs --category=security";

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

console.log("Applied v0.8.0 security-description hotfix.");
console.log("package.json description now includes both Public Demo Release Candidate and Security and Key Handling.");
console.log("Next commands:");
console.log("npm run security:key:check");
console.log("npm run qa");
console.log("npm run typecheck");
console.log("npm run lint");
console.log("npm run build");
