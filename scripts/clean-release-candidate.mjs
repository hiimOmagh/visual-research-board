import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const removableDirs = [
  ".next",
  "out",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
  ".turbo",
  ".vercel/output"
];

const removableRootFilePatterns = [
  /^visual-research-board-.*\.zip$/,
  /^.*\.tsbuildinfo$/,
  /^npm-debug\.log$/,
  /^yarn-error\.log$/,
  /^pnpm-debug\.log$/
];

const removableArtifactPatterns = [
  /^.*\.tmp$/,
  /^.*\.temp$/,
  /^.*\.bak$/,
  /^.*\.zip$/
];

const preserveFiles = new Set([
  "artifacts/full-qa-gate-report.json"
]);

function removePath(targetPath) {
  if (!fs.existsSync(targetPath)) return false;
  fs.rmSync(targetPath, { recursive: true, force: true });
  return true;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if ([".git", "node_modules"].includes(entry.name)) continue;
      results.push(...walk(fullPath));
    } else {
      results.push(relativePath);
    }
  }
  return results;
}

const removed = [];

for (const dir of removableDirs) {
  if (removePath(path.join(root, dir))) removed.push(dir);
}

for (const file of fs.readdirSync(root)) {
  const fullPath = path.join(root, file);
  if (!fs.statSync(fullPath).isFile()) continue;
  if (removableRootFilePatterns.some((pattern) => pattern.test(file))) {
    fs.rmSync(fullPath, { force: true });
    removed.push(file);
  }
}

const artifactDir = path.join(root, "artifacts");
if (fs.existsSync(artifactDir)) {
  for (const relativeFile of walk(artifactDir)) {
    if (preserveFiles.has(relativeFile)) continue;
    const fileName = path.basename(relativeFile);
    if (removableArtifactPatterns.some((pattern) => pattern.test(fileName))) {
      fs.rmSync(path.join(root, relativeFile), { force: true });
      removed.push(relativeFile);
    }
  }
}

console.log("Release-candidate cleanup complete.");
if (removed.length === 0) {
  console.log("No generated release artifacts required cleanup.");
} else {
  console.log("Removed:");
  for (const item of removed) console.log(`- ${item}`);
}
console.log("\nPreserved source files, package files, env files, node_modules, and artifacts/full-qa-gate-report.json when present.");
