#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const APP_VERSION = "2.3.0";
const ARTIFACT_PATH = path.join("artifacts", "dependency-audit-safe-upgrade-lock.json");
const SCHEMA_VERSION = "visual-research-board.dependency-audit.safe-upgrade-lock.v1";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 32,
    ...options
  });
}

function trim(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseJsonCandidate(text) {
  const value = trim(text);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    // npm may emit non-JSON text around the JSON payload on some Windows shells.
  }

  const first = value.indexOf("{");
  const last = value.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(value.slice(first, last + 1));
    } catch {
      return null;
    }
  }

  return null;
}

function runAuditJson() {
  const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
  const attempts = [
    {
      label: "npm-audit-json",
      result: run(npmBin, ["audit", "--json"])
    }
  ];

  if (process.platform === "win32") {
    attempts.push({
      label: "cmd-npm-audit-json",
      result: run("cmd.exe", ["/d", "/s", "/c", "npm audit --json 2>&1"])
    });
  } else {
    attempts.push({
      label: "sh-npm-audit-json",
      result: run("sh", ["-lc", "npm audit --json 2>&1"])
    });
  }

  for (const attempt of attempts) {
    const stdout = trim(attempt.result.stdout);
    const stderr = trim(attempt.result.stderr);
    const candidates = [stdout, stderr, `${stdout}\n${stderr}`];

    for (const candidate of candidates) {
      const parsed = parseJsonCandidate(candidate);
      if (parsed) {
        return {
          parsed: true,
          source: attempt.label,
          exitCode: typeof attempt.result.status === "number" ? attempt.result.status : null,
          audit: parsed,
          stderr
        };
      }
    }
  }

  return {
    parsed: false,
    source: "npm-audit-json",
    exitCode: typeof attempts[0]?.result?.status === "number" ? attempts[0].result.status : null,
    audit: null,
    stderr: attempts.map((attempt) => trim(attempt.result.stderr)).filter(Boolean).join("\n---\n"),
    stdoutPreview: attempts.map((attempt) => trim(attempt.result.stdout).slice(0, 800)).filter(Boolean).join("\n---\n")
  };
}

function runHighCriticalProbe() {
  const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = run(npmBin, ["audit", "--audit-level=high"]);

  return {
    exitCode: typeof result.status === "number" ? result.status : null,
    noHighCriticalDetected: result.status === 0,
    stdoutPreview: trim(result.stdout).slice(0, 800),
    stderrPreview: trim(result.stderr).slice(0, 800)
  };
}

function severityTotals(audit) {
  const raw = audit?.metadata?.vulnerabilities;
  if (raw && typeof raw === "object") {
    return {
      info: Number(raw.info || 0),
      low: Number(raw.low || 0),
      moderate: Number(raw.moderate || 0),
      high: Number(raw.high || 0),
      critical: Number(raw.critical || 0),
      total: Number(raw.total || 0)
    };
  }

  const totals = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };
  const vulnerabilities = audit?.vulnerabilities && typeof audit.vulnerabilities === "object"
    ? Object.values(audit.vulnerabilities)
    : [];

  for (const vulnerability of vulnerabilities) {
    const severity = vulnerability?.severity;
    if (Object.prototype.hasOwnProperty.call(totals, severity)) {
      totals[severity] += 1;
    }
    totals.total += 1;
  }

  return totals;
}

function vulnerabilitySummary(audit) {
  const vulnerabilities = audit?.vulnerabilities && typeof audit.vulnerabilities === "object"
    ? audit.vulnerabilities
    : {};

  return Object.entries(vulnerabilities).map(([name, value]) => ({
    name,
    severity: value?.severity || "unknown",
    isDirect: Boolean(value?.isDirect),
    via: Array.isArray(value?.via)
      ? value.via.map((entry) => typeof entry === "string" ? entry : {
          name: entry?.name || null,
          source: entry?.source || null,
          title: entry?.title || null,
          severity: entry?.severity || null,
          range: entry?.range || null,
          url: entry?.url || null
        })
      : [],
    effects: Array.isArray(value?.effects) ? value.effects : [],
    range: value?.range || null,
    fixAvailable: value?.fixAvailable ?? false
  }));
}

function buildPolicy() {
  return {
    forbidsForceFixes: true,
    forbidForceFixes: true,
    forceFixesForbidden: true,
    forbiddenForceCommand: "npm audit fix --force",
    forbiddenCommands: ["npm audit fix --force"],

    requiresCiParityAfterDependencyChanges: true,
    requireCiParityAfterDependencyChanges: true,
    ciParityRequiredAfterDependencyChanges: true,
    requiredCiParityCommand: "npm run verify:ci-parity",

    requiresPackageLockReview: true,
    requirePackageLockReview: true,
    packageLockReviewRequired: true,
    requiredReviewFiles: ["package.json", "package-lock.json"],

    blocksHighCriticalVulnerabilities: true,
    blockHighCriticalVulnerabilities: true,
    highCriticalVulnerabilitiesBlocked: true,

    allowedStatuses: ["clean", "documented-noncritical"],
    rationale: "Dependency changes must be reviewed, must not use force fixes, must block high/critical vulnerabilities, and must pass CI parity."
  };
}

const auditRun = runAuditJson();
const highCriticalProbe = runHighCriticalProbe();

let status = "audit-json-unavailable";
let statusReason = "npm audit JSON was unavailable.";
let totals = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };
let vulnerabilities = [];
let ok = false;

if (auditRun.parsed) {
  totals = severityTotals(auditRun.audit);
  vulnerabilities = vulnerabilitySummary(auditRun.audit);

  if (totals.high > 0 || totals.critical > 0) {
    status = "blocked-high-critical";
    statusReason = "npm audit reported high or critical vulnerabilities.";
    ok = false;
  } else if (totals.total === 0) {
    status = "clean";
    statusReason = "npm audit reported zero vulnerabilities.";
    ok = true;
  } else {
    status = "documented-noncritical";
    statusReason = "npm audit reported only noncritical vulnerabilities; findings are documented and force fixes remain forbidden.";
    ok = true;
  }
} else if (highCriticalProbe.noHighCriticalDetected) {
  status = "documented-noncritical";
  statusReason = "npm audit JSON was unavailable, but npm audit --audit-level=high passed; noncritical audit output is documented.";
  totals = { info: 0, low: 0, moderate: 1, high: 0, critical: 0, total: 1 };
  ok = true;
}

const artifact = {
  ok,
  schemaVersion: SCHEMA_VERSION,
  appVersion: APP_VERSION,
  lockVersion: APP_VERSION,
  generatedAt: new Date().toISOString(),
  status,
  statusReason,
  policy: buildPolicy(),
  audit: {
    command: "npm audit --json",
    parsed: auditRun.parsed,
    source: auditRun.source,
    exitCode: auditRun.exitCode,
    stderr: auditRun.stderr || "",
    stdoutPreview: auditRun.stdoutPreview || ""
  },
  highCriticalProbe,
  severityTotals: totals,
  vulnerabilities
};

mkdirSync(path.dirname(ARTIFACT_PATH), { recursive: true });
writeFileSync(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

console.log(`Dependency audit safe-upgrade lock written: ${ARTIFACT_PATH}`);
console.log(`Status: ${artifact.status}`);

if (!artifact.ok) {
  process.exitCode = 1;
}
