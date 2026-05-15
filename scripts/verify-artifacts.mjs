import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
const root = process.cwd();
const version = "2.2.0";

const artifactScripts = [
  
  "provider-runtime:report","first-run:visual:evidence",
  "first-run:evidence-review",
  "first-run:demo-script",
  "release:evidence:index",
  "dependency:audit:safe-lock",
];

function resolveNpmCli() {
  const envPath = process.env.npm_execpath;
  if (envPath && envPath.endsWith("npm-cli.js") && existsSync(envPath)) {
    return envPath;
  }

  const nodeDir = dirname(process.execPath);
  const bundledNpmCli = join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js");
  if (existsSync(bundledNpmCli)) {
    return bundledNpmCli;
  }

  const localNpmCli = join(root, "node_modules", "npm", "bin", "npm-cli.js");
  if (existsSync(localNpmCli)) {
    return localNpmCli;
  }

  return null;
}

function runNpmScript(scriptName) {
  const npmCli = resolveNpmCli();

  if (!npmCli) {
    console.error(`[verify-artifacts] could not resolve npm-cli.js for ${scriptName}`);
    process.exitCode = 1;
    return false;
  }

  console.log(`\n[verify-artifacts] npm run ${scriptName}`);

  const result = spawnSync(process.execPath, [npmCli, "run", scriptName], {
    cwd: root,
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      VRB_NESTED_VERIFY: "1",
      VRB_VERIFY_ARTIFACTS: "1",
    },
  });

  if (result.error) {
    console.error(`[verify-artifacts] failed to start ${scriptName}: ${result.error.message}`);
    process.exitCode = 1;
    return false;
  }

  if (result.status !== 0) {
    console.error(`[verify-artifacts] failed at ${scriptName}`);
    process.exitCode = result.status || 1;
    return false;
  }

  return true;
}

for (const scriptName of artifactScripts) {
  if (!runNpmScript(scriptName)) {
    process.exit(process.exitCode || 1);
  }
}

console.log(`\n[verify-artifacts] passed for v${version}`);
