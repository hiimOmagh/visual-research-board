#!/usr/bin/env node
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, "").split("=");
  return [key, rest.join("=") || "true"];
}));

const basePath = args.get("base-path") ?? process.env.VISUAL_RESEARCH_BOARD_BASE_PATH ?? "";
const appApiDir = resolve(root, "src/app/api");
const disabledApiDir = resolve(root, ".vrb-static-disabled-api");
const hadApiDir = existsSync(appApiDir);

function restoreApiRoutes() {
  if (existsSync(disabledApiDir) && !existsSync(appApiDir)) {
    renameSync(disabledApiDir, appApiDir);
  }
}

process.on("exit", restoreApiRoutes);
process.on("SIGINT", () => { restoreApiRoutes(); process.exit(130); });
process.on("SIGTERM", () => { restoreApiRoutes(); process.exit(143); });

try {
  rmSync(resolve(root, "out"), { recursive: true, force: true });
  if (hadApiDir) {
    rmSync(disabledApiDir, { recursive: true, force: true });
    renameSync(appApiDir, disabledApiDir);
  }

  const env = {
    ...process.env,
    VISUAL_RESEARCH_BOARD_STATIC_EXPORT: "true",
    NEXT_PUBLIC_VISUAL_RESEARCH_BOARD_STATIC_DEMO: "true"
  };
  if (basePath && basePath !== "/") env.VISUAL_RESEARCH_BOARD_BASE_PATH = basePath.replace(/\/$/, "");

  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(command, ["next", "build"], { cwd: root, env, stdio: "inherit" });

  restoreApiRoutes();

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const outDir = join(root, "out");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, ".nojekyll"), "");
  console.log("Static demo exported to out/ with .nojekyll.");
} catch (error) {
  restoreApiRoutes();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
