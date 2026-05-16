import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const targetVersion = "2.4.0";
const basePathRaw = (process.env.VISUAL_RESEARCH_BOARD_BASE_PATH || "/visual-research-board").trim();
const basePath = basePathRaw && basePathRaw !== "/" ? basePathRaw.replace(/\/$/, "") : "";
const staticExportEnv = {
  ...process.env,
  NODE_ENV: "production",
  VISUAL_RESEARCH_BOARD_STATIC_EXPORT: "true",
  VISUAL_RESEARCH_BOARD_BASE_PATH: basePath || undefined
};

const movedApiDirs = [];

function log(message) {
  console.log(`[github-pages-static-export] ${message}`);
}

function exists(p) {
  return fs.existsSync(p);
}

function rm(p) {
  if (exists(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

function mkdir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runNodeScript(scriptPath, args, options = {}) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: projectRoot,
    env: staticExportEnv,
    stdio: "inherit",
    shell: false,
    ...options
  });
  if (result.status !== 0) {
    throw new Error(`${scriptPath} ${args.join(" ")} exited with status ${result.status}`);
  }
}

function runNpmScript(scriptName) {
  const npmCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  if (!exists(npmCli)) {
    const result = spawnSync("npm", ["run", scriptName], {
      cwd: projectRoot,
      env: staticExportEnv,
      stdio: "inherit",
      shell: process.platform === "win32"
    });
    if (result.status !== 0) throw new Error(`npm run ${scriptName} exited with status ${result.status}`);
    return;
  }
  runNodeScript(npmCli, ["run", scriptName]);
}

function moveApiDir(relativePath) {
  const source = path.join(projectRoot, relativePath);
  if (!exists(source)) return;
  const target = path.join(projectRoot, ".vrb-static-export-temp", relativePath.replace(/[\\/]/g, "__"));
  rm(target);
  mkdir(path.dirname(target));
  fs.renameSync(source, target);
  movedApiDirs.push({ source, target, relativePath });
  log(`temporarily moved ${relativePath} outside the app tree`);
}

function restoreApiDirs() {
  for (const moved of movedApiDirs.reverse()) {
    rm(moved.source);
    mkdir(path.dirname(moved.source));
    if (exists(moved.target)) {
      fs.renameSync(moved.target, moved.source);
      log(`restored ${moved.relativePath}`);
    }
  }
  movedApiDirs.length = 0;
  rm(path.join(projectRoot, ".vrb-static-export-temp"));
}

function collectHtmlFiles(dir) {
  if (!exists(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
    }
  }
  return out.sort();
}

function collectCssFiles(dir) {
  if (!exists(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith(".css")) out.push(full);
    }
  }
  return out.sort();
}

function normalizeHref(p) {
  return p.replace(/\\/g, "/");
}

function writeNoJekyll() {
  const noJekyll = path.join(projectRoot, "out", ".nojekyll");
  fs.writeFileSync(noJekyll, "");
  log("wrote out/.nojekyll so GitHub Pages serves _next assets");
}

function buildTailwindCss() {
  const inputCss = path.join(projectRoot, "src", "app", "globals.css");
  const tailwindCli = path.join(projectRoot, "node_modules", "tailwindcss", "lib", "cli.js");
  const outputDir = path.join(projectRoot, "out", "_next", "static", "css");
  const outputCss = path.join(outputDir, "visual-research-board-static.css");

  if (!exists(inputCss)) {
    throw new Error("Missing src/app/globals.css; cannot build static CSS for GitHub Pages.");
  }
  if (!exists(tailwindCli)) {
    throw new Error("Missing Tailwind CLI at node_modules/tailwindcss/lib/cli.js. Run npm ci first.");
  }

  mkdir(outputDir);

  const contentGlobs = [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ];

  log("building explicit Tailwind CSS asset for GitHub Pages static export");
  runNodeScript(tailwindCli, [
    "-i",
    inputCss,
    "-o",
    outputCss,
    "--minify",
    "--content",
    contentGlobs.join(",")
  ]);

  if (!exists(outputCss) || fs.statSync(outputCss).size < 500) {
    throw new Error(`Tailwind CSS output missing or suspiciously small: ${outputCss}`);
  }
  return outputCss;
}

function injectCssLink(cssFile) {
  const outDir = path.join(projectRoot, "out");
  const relativeCss = normalizeHref(path.relative(outDir, cssFile));
  const cssHref = `${basePath}/${relativeCss}`.replace(/\/+/g, "/");
  const linkTag = `<link rel="stylesheet" href="${cssHref}"/>`;
  const htmlFiles = collectHtmlFiles(outDir);

  if (!htmlFiles.length) {
    throw new Error("No HTML files found in out/ after static export.");
  }

  for (const htmlFile of htmlFiles) {
    let html = fs.readFileSync(htmlFile, "utf8");
    if (html.includes(cssHref)) continue;
    if (html.includes("</head>")) {
      html = html.replace("</head>", `${linkTag}</head>`);
    } else if (html.includes("<body")) {
      html = html.replace("<body", `${linkTag}<body`);
    } else {
      html = `${linkTag}${html}`;
    }
    fs.writeFileSync(htmlFile, html, "utf8");
  }

  log(`injected stylesheet link: ${cssHref}`);
  return cssHref;
}

function validateOutput(cssHref) {
  const outDir = path.join(projectRoot, "out");
  const requiredFiles = [
    path.join(outDir, "index.html"),
    path.join(outDir, "creator-workflow", "index.html")
  ];
  const missing = requiredFiles.filter((file) => !exists(file));
  const cssFiles = collectCssFiles(path.join(outDir, "_next", "static"));

  if (cssFiles.length === 0) {
    missing.push("out/_next/static/**/*.css");
  }

  for (const requiredFile of requiredFiles) {
    if (!exists(requiredFile)) continue;
    const html = fs.readFileSync(requiredFile, "utf8");
    if (!html.includes(cssHref)) {
      missing.push(`${normalizeHref(path.relative(projectRoot, requiredFile))} stylesheet link ${cssHref}`);
    }
  }

  const indexHtml = exists(requiredFiles[0]) ? fs.readFileSync(requiredFiles[0], "utf8") : "";
  const expectedCreatorHref = `${basePath}/creator-workflow`.replace(/\/+/g, "/");
  if (basePath && !indexHtml.includes(expectedCreatorHref)) {
    missing.push(`base-path creator workflow link ${expectedCreatorHref}`);
  }

  if (basePath) {
    const forbiddenStaticLinks = [
      'href="/creator-workflow"',
      'href="/api/',
      'src="/_next/',
      'href="/_next/'
    ];
    for (const htmlFile of collectHtmlFiles(outDir)) {
      const html = fs.readFileSync(htmlFile, "utf8");
      const relativeHtml = normalizeHref(path.relative(projectRoot, htmlFile));
      for (const token of forbiddenStaticLinks) {
        if (html.includes(token)) {
          missing.push(`forbidden static root-relative link ${token} in ${relativeHtml}`);
        }
      }
    }
  }

  if (missing.length > 0) {
    const htmlFiles = collectHtmlFiles(outDir).map((file) => normalizeHref(path.relative(projectRoot, file)));
    throw new Error(
      `GitHub Pages static export is incomplete. Missing: ${missing.join(", ")}. HTML files found: ${htmlFiles.join(", ") || "none"}.`
    );
  }

  log("static export validation passed");
  log(`html: ${normalizeHref(path.relative(projectRoot, requiredFiles[0]))}`);
  log(`html: ${normalizeHref(path.relative(projectRoot, requiredFiles[1]))}`);
  for (const cssFile of cssFiles) {
    log(`css: ${normalizeHref(path.relative(projectRoot, cssFile))}`);
  }
}

function main() {
  const pkg = readJson(path.join(projectRoot, "package.json"));
  if (pkg.version !== targetVersion) {
    throw new Error(`Package version must remain ${targetVersion} for this hotfix; received ${pkg.version}`);
  }

  log("starting static export");
  log(`version: ${pkg.version}`);
  log(`base path: ${basePath || "/"}`);

  rm(path.join(projectRoot, ".next"));
  rm(path.join(projectRoot, "out"));

  try {
    moveApiDir(path.join("src", "app", "api"));
    moveApiDir(path.join("app", "api"));
    rm(path.join(projectRoot, ".next"));
    runNpmScript("build");
    const cssFile = buildTailwindCss();
    writeNoJekyll();
    const cssHref = injectCssLink(cssFile);
    validateOutput(cssHref);
  } finally {
    restoreApiDirs();
    rm(path.join(projectRoot, ".next"));
  }
}

main();
