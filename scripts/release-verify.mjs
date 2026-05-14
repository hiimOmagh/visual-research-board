import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const startedAt = new Date().toISOString();
const artifactsDir = path.join(root, "artifacts");
const reportPath = path.join(artifactsDir, "release-verify-report.json");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function resolveNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function resolveCommand(command, args) {
  if (command === "npm") {
    const npmCli = resolveNpmCli();

    if (npmCli) {
      return {
        command: process.execPath,
        args: [npmCli, ...args]
      };
    }

    return {
      command: process.platform === "win32" ? "npm.cmd" : "npm",
      args
    };
  }

  return { command, args };
}

function runCommand(command, args, options = {}) {
  const label = [command, ...args].join(" ");
  const start = Date.now();

  console.log(`\n[release-verify] ${label}`);

  const resolved = resolveCommand(command, args);

  const result = spawnSync(resolved.command, resolved.args, {
    cwd: root,
    shell: false,
    stdio: "inherit",
    env: process.env,
    ...options
  });

  if (result.error) {
    console.error(`[release-verify] failed to start ${label}: ${result.error.message}`);
  }

  const duration_ms = Date.now() - start;
  const ok = result.status === 0;

  return {
    label,
    command,
    args,
    resolved_command: resolved.command,
    resolved_args: resolved.args,
    ok,
    status: result.status,
    signal: result.signal,
    duration_ms,
    error: result.error ? result.error.message : null
  };
}

function writeReport(report) {
  fs.mkdirSync(artifactsDir, { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

function npmRun(script) {
  return runCommand("npm", ["run", script]);
}

const pkg = readJson("package.json");
const version = pkg.version;

const report = {
  schema_version: "1.0.0",
  app_version: version,
  release_label: `v${version}`,
  status: "running",
  started_at: startedAt,
  finished_at: null,
  failed_command: null,
  command_count: 0,
  passed_command_count: 0,
  failed_command_count: 0,
  planned_scripts: [],
  commands: [],
  notes: [
    "Do not run npm audit fix --force in this release verification runner.",
    "Run npm ci before verify:release when node_modules is missing.",
    "Use verify:ci-parity for a clean install plus release verification path."
  ]
};

function finish(status, failedCommand = null) {
  report.status = status;
  report.finished_at = new Date().toISOString();
  report.failed_command = failedCommand;
  report.command_count = report.commands.length;
  report.passed_command_count = report.commands.filter((cmd) => cmd.ok).length;
  report.failed_command_count = report.commands.filter((cmd) => !cmd.ok).length;
  writeReport(report);
}

try {
  ensure(exists("package.json"), "package.json missing");
  ensure(exists("package-lock.json"), "package-lock.json missing");
  ensure(exists("scripts/full-qa-gate.mjs"), "scripts/full-qa-gate.mjs missing");
  ensure(exists("tests/release-verify-runner-check.mjs"), "release verify runner check missing");
  ensure(exists("node_modules"), "node_modules missing. Run npm ci first, or run npm run verify:ci-parity.");

  const plannedScripts = [
    "release:verify:runner:check",
    "single-command:verification:check",
    "first-run:ux:check",
    "first-run:panel:check",
    "first-run:visual:check",
    "first-run:evidence-review:check",
    "first-run:demo-script:check",
    "release:package:audit:check",
    "public-demo:screenshot:check",
    "dependency:audit:triage:check",
    "stable:hygiene:check",
    "reference-workflow:stable:check",
    "activation-pack:export:check",
    "activation-pack:export-preview:check",
    "activation-pack:ui:check",
    "public-demo:stable:check",
    "public-demo:final:check",
    "hosted-demo:evidence:check",
    "public-demo:evidence:check",
    "release:warning:check",
    "public-demo:check",
    "qa:public-demo",
    "security:key:check",
    "qa",
    "typecheck",
    "lint",
    "build",
    "release:package:audit:check",
    "release:verify:runner:check"
  ];

  report.planned_scripts = plannedScripts;

  for (const script of plannedScripts) {
    const commandResult = npmRun(script);
    report.commands.push(commandResult);

    if (!commandResult.ok) {
      finish("failed", commandResult.label);
      process.exit(commandResult.status || 1);
    }
  }

  finish("passed", null);
  console.log(`\n[release-verify] passed for v${version}`);
  console.log(`[release-verify] report: ${path.relative(root, reportPath)}`);
} catch (error) {
  const commandResult = {
    label: "preflight",
    command: "preflight",
    args: [],
    resolved_command: "preflight",
    resolved_args: [],
    ok: false,
    status: 1,
    signal: null,
    duration_ms: 0,
    error: error instanceof Error ? error.message : String(error)
  };

  report.commands.push(commandResult);
  finish("failed", commandResult.label);

  console.error(`\n[release-verify] ${commandResult.error}`);
  console.error(`[release-verify] report: ${path.relative(root, reportPath)}`);
  process.exit(1);
}
