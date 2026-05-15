import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const artifactDir = path.join(root, "artifacts");
const outPath = path.join(artifactDir, "release-evidence-index.json");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = packageJson.version;

const evidenceFiles = [
  "artifacts/full-qa-gate-report.json",
  "artifacts/release-verify-report.json",
  "artifacts/first-run-visual-evidence.json",
  "artifacts/first-run-evidence-review.json",
  "artifacts/first-run-demo-script.json"
];

function fileRecord(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return {
      path: relativePath,
      exists: false,
      size_bytes: 0,
      sha256: null,
      status: "missing"
    };
  }

  const buffer = fs.readFileSync(absolutePath);
  let jsonStatus = "not-json";
  let artifactStatus = "unknown";
  let artifactVersion = null;

  try {
    const parsed = JSON.parse(buffer.toString("utf8"));
    jsonStatus = "valid";
    artifactStatus = parsed.status ?? parsed.result ?? parsed.state ?? "present";
    artifactVersion = parsed.app_version ?? parsed.appVersion ?? parsed.version ?? null;
  } catch {
    jsonStatus = "invalid";
    artifactStatus = "invalid-json";
  }

  return {
    path: relativePath,
    exists: true,
    size_bytes: buffer.length,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
    json_status: jsonStatus,
    status: artifactStatus,
    app_version: artifactVersion
  };
}

fs.mkdirSync(artifactDir, { recursive: true });

const files = evidenceFiles.map(fileRecord);
const missing = files.filter((file) => !file.exists).map((file) => file.path);
const invalidJson = files.filter((file) => file.exists && file.json_status === "invalid").map((file) => file.path);

const index = {
  schema: "visual-research-board.release-evidence-index.v1",
  app_version: version,
  generated_at: new Date().toISOString(),
  status: missing.length === 0 && invalidJson.length === 0 ? "indexed" : "partial",
  artifact_count: files.length,
  missing_count: missing.length,
  invalid_json_count: invalidJson.length,
  files,
  commands: {
    generate: "npm run release:evidence:index",
    check: "npm run release:evidence:index:check",
    local_release: "npm run verify:all",
    ci_parity: "npm run verify:ci-parity"
  },
  notes: [
    "Index is an artifact inventory, not a rights-clearance statement.",
    "Missing files are allowed before first verification run but should be resolved before release tagging.",
    "The release verifier regenerates this index during verification."
  ]
};

fs.writeFileSync(outPath, JSON.stringify(index, null, 2) + "\n");
console.log(`Release evidence index written: ${path.relative(root, outPath)}`);
console.log(`Status: ${index.status}`);
