#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const FROM_VERSION = "0.8.0";
const TO_VERSION = "0.8.0";
const FROM_LABEL = `v${FROM_VERSION}`;
const TO_LABEL = `v${TO_VERSION}`;

const allowedExtensions = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".yml", ".yaml", ".example", ".txt"
]);

const skipDirs = new Set([
  ".git", "node_modules", ".next", "out", "dist", "coverage", "playwright-report", "test-results", ".turbo", ".vercel"
]);

const skipFiles = new Set([
  "artifacts/full-qa-gate-report.json"
]);

function rel(p) {
  return path.relative(root, p).replaceAll("\\\\", "/");
}

function shouldScan(filePath) {
  const relative = rel(filePath);
  if (skipFiles.has(relative)) return false;
  const base = path.basename(filePath);
  const ext = path.extname(filePath);
  if (allowedExtensions.has(ext)) return true;
  if (base === ".env.example") return true;
  return false;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (entry.isFile() && shouldScan(fullPath)) files.push(fullPath);
  }
  return files;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function updatePackageFiles() {
  if (!fs.existsSync(path.join(root, "package.json"))) {
    throw new Error("package.json not found. Run this script from the repository root.");
  }

  const pkg = readJson("package.json");
  pkg.version = TO_VERSION;
  pkg.description = "Public Demo Release Candidate for demo-safe sample data, visible limitations, release-candidate QA, and non-misleading provider/runtime presentation.";
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["public-demo:check"] = "node tests/public-demo-release-candidate-check.mjs";
  pkg.scripts["qa:public-demo"] = "node scripts/full-qa-gate.mjs --category=public-demo";
  pkg.scripts["clean:rc"] = "node scripts/clean-release-candidate.mjs";
  pkg.scripts["security:key:check"] = pkg.scripts["security:key:check"] || "node tests/security-key-handling-check.mjs";
  pkg.scripts["qa:security"] = pkg.scripts["qa:security"] || "node scripts/full-qa-gate.mjs --category=security";
  writeJson("package.json", pkg);

  if (fs.existsSync(path.join(root, "package-lock.json"))) {
    const lock = readJson("package-lock.json");
    lock.version = TO_VERSION;
    if (lock.packages && lock.packages[""]) lock.packages[""].version = TO_VERSION;
    writeJson("package-lock.json", lock);
  }
}

function updateFullQaGate() {
  const gatePath = path.join(root, "scripts/full-qa-gate.mjs");
  if (!fs.existsSync(gatePath)) return;

  let text = fs.readFileSync(gatePath, "utf8");

  const publicDemoGate = '  { category: "public-demo", name: "public-demo-release-candidate", command: ["node", "tests/public-demo-release-candidate-check.mjs"] },';
  if (!text.includes("public-demo-release-candidate")) {
    const securityGate = /(^\s*\{ category: "security", name: "provider-key-handling", command: \["node", "tests\/security-key-handling-check\.mjs"\] \},\s*$)/m;
    if (securityGate.test(text)) {
      text = text.replace(securityGate, `$1\n${publicDemoGate}`);
    } else {
      text = text.replace(/const gates = \[\s*/, (match) => `${match}${publicDemoGate}\n`);
    }
  }

  text = text.replaceAll(FROM_LABEL, TO_LABEL).replaceAll(FROM_VERSION, TO_VERSION);
  text = text.replace(/schema_version:\s*"[0-9.]+"/, `schema_version: "${TO_VERSION}"`);
  text = text.replace(/app_version:\s*"[0-9.]+"/, `app_version: "${TO_VERSION}"`);
  text = text.replace(/Full QA gate passed for v[0-9.]+\./, `Full QA gate passed for v${TO_VERSION}.`);

  fs.writeFileSync(gatePath, text, "utf8");
}

function versionAlignFiles() {
  const files = walk(root);
  const changed = [];

  for (const filePath of files) {
    let text = fs.readFileSync(filePath, "utf8");
    const original = text;
    text = text.replaceAll(FROM_LABEL, TO_LABEL).replaceAll(FROM_VERSION, TO_VERSION);

    if (text !== original) {
      fs.writeFileSync(filePath, text, "utf8");
      changed.push(rel(filePath));
    }
  }

  return changed;
}

function verify() {
  const failures = [];
  const pkg = readJson("package.json");

  if (pkg.version !== TO_VERSION) failures.push(`package.json version is ${pkg.version}, expected ${TO_VERSION}`);
  if (pkg.scripts?.["public-demo:check"] !== "node tests/public-demo-release-candidate-check.mjs") failures.push("public-demo:check script missing or incorrect");
  if (pkg.scripts?.["qa:public-demo"] !== "node scripts/full-qa-gate.mjs --category=public-demo") failures.push("qa:public-demo script missing or incorrect");
  if (pkg.scripts?.["security:key:check"] !== "node tests/security-key-handling-check.mjs") failures.push("security:key:check was not preserved");
  if (pkg.scripts?.["qa:security"] !== "node scripts/full-qa-gate.mjs --category=security") failures.push("qa:security was not preserved");

  const fullGatePath = path.join(root, "scripts/full-qa-gate.mjs");
  if (fs.existsSync(fullGatePath)) {
    const fullGate = fs.readFileSync(fullGatePath, "utf8");
    if (!fullGate.includes("public-demo-release-candidate")) failures.push("full QA gate does not include public-demo release-candidate gate");
    if (!fullGate.includes(`schema_version: "${TO_VERSION}"`)) failures.push("full QA gate schema_version is not aligned to 0.8.0");
    if (!fullGate.includes(`app_version: "${TO_VERSION}"`)) failures.push("full QA gate app_version is not aligned to 0.8.0");
  }

  const qaCheckPath = path.join(root, "tests/qa-check.mjs");
  if (fs.existsSync(qaCheckPath)) {
    const qaCheck = fs.readFileSync(qaCheckPath, "utf8");
    if (qaCheck.includes('pkg.version === "0.8.0"')) failures.push("tests/qa-check.mjs still expects package version 0.8.0");
    if (qaCheck.includes('SearchPanel header must show v0.8.0')) failures.push("tests/qa-check.mjs still expects SearchPanel header v0.8.0");
  }

  const searchPanelPath = path.join(root, "src/components/search/SearchPanel.tsx");
  if (fs.existsSync(searchPanelPath)) {
    const searchPanel = fs.readFileSync(searchPanelPath, "utf8");
    if (searchPanel.includes("v0.8.0")) failures.push("SearchPanel still contains v0.8.0");
    if (searchPanel.includes("visual-research-board-library-v0.8.0.json")) failures.push("SearchPanel library export filename still contains v0.8.0");
  }

  const allFiles = walk(root);
  const stale = [];
  for (const filePath of allFiles) {
    const relative = rel(filePath);
    if (relative.includes("RUNBOOK-v0.8.0") || relative.includes("COMPATIBILITY-REVIEW-v0.8.0")) continue;
    const text = fs.readFileSync(filePath, "utf8");
    if (text.includes('pkg.version === "0.8.0"') || text.includes('APP_VERSION = "0.8.0"') || text.includes('schema_version: "0.8.0"') || text.includes('app_version: "0.8.0"')) {
      stale.push(relative);
    }
  }
  if (stale.length) failures.push(`stale hard-coded 0.8.0 assertions/constants remain: ${stale.join(", ")}`);

  if (failures.length) {
    console.error("v0.8.0 CI hotfix verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

updatePackageFiles();
updateFullQaGate();
const changed = versionAlignFiles();
verify();

console.log("Applied v0.8.0 CI hotfix: version alignment completed.");
console.log(`Updated ${changed.length} files containing stale v0.8.0 references.`);
console.log("Next commands:");
console.log("npm run public-demo:check");
console.log("npm run qa:public-demo");
console.log("npm run security:key:check");
console.log("npm run qa");
console.log("npm run typecheck");
console.log("npm run lint");
console.log("npm run build");
