import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { applyEdits, modify, parse } from "jsonc-parser";
import {
  catalogVersion,
  getCollection,
  iconSummary,
  isCollidingId,
  localIconTree,
  requireIcon
} from "./catalog";

export type Target = "react" | "react-native";
export type Language = "ts" | "js";
export type ProjectManifest = {
  schemaVersion: 1;
  catalogVersion: string;
  target: Target;
  language: Language;
  outputPath: "src/ri";
  stylesheetPath?: string;
  icons: Record<
    string,
    { component: string; path: string; sha256: string; collection: string; licenseUrl: string }
  >;
};
export type Change = {
  path: string;
  action: "create" | "update" | "delete" | "dependency-install";
};
export type MutationResult = {
  projectPath: string;
  dryRun: boolean;
  changes: Change[];
  summary: string;
};

const sha = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const within = (root: string, path: string) => {
  const rel = relative(root, path);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
};
export const projectRoot = (projectPath: string) => {
  if (!isAbsolute(projectPath)) throw new Error("project_path must be absolute");
  if (lstatSync(projectPath).isSymbolicLink())
    throw new Error("project_path must not be a symlink");
  const root = realpathSync(projectPath);
  if (!existsSync(join(root, "package.json"))) throw new Error("No package.json in project_path");
  for (const rel of [
    "package.json",
    "node_modules",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lock",
    "bun.lockb"
  ])
    safePath(root, rel);
  return root;
};
const safePath = (root: string, rel: string) => {
  const path = resolve(root, rel);
  if (!within(root, path)) throw new Error(`Path escapes project: ${rel}`);
  let part = root;
  for (const segment of relative(root, path).split(/[\\/]/).filter(Boolean)) {
    part = join(part, segment);
    if (lstatSync(part, { throwIfNoEntry: false })?.isSymbolicLink())
      throw new Error(`Symlink is not allowed in managed path: ${relative(root, part)}`);
  }
  return path;
};
const existing = (root: string, rel: string) => {
  const path = safePath(root, rel);
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
};
const projectFiles = (root: string) => {
  const files: string[] = [];
  const ignored = new Set([
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
    "public",
    ".rocketicons-cache"
  ]);
  const visit = (rel: string, depth: number) => {
    if (depth > 7 || files.length > 10000) return;
    for (const entry of readdirSync(safePath(root, rel), { withFileTypes: true })) {
      if (ignored.has(entry.name) || entry.name.startsWith(".")) continue;
      const next = join(rel, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) visit(next, depth + 1);
      else if (entry.isFile()) files.push(next.replace(/\\/g, "/"));
    }
  };
  visit(".", 0);
  return files;
};
const tailwindMajor = (root: string) => {
  const pkg = JSON.parse(readFileSync(safePath(root, "package.json"), "utf8"));
  const version = { ...pkg.dependencies, ...pkg.devDependencies }.tailwindcss;
  const declared =
    typeof version === "string" ? Number(/^[~^]?\s*(\d+)/.exec(version)?.[1]) : NaN;
  if (declared !== 4) return declared;
  try {
    const installed = JSON.parse(
      readFileSync(join(root, "node_modules/tailwindcss/package.json"), "utf8")
    );
    return Number(String(installed.version).split(".")[0]);
  } catch {
    // Plans can run before dependencies have been installed.
  }
  return declared;
};
const activeCss = (css: string) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (comment) => " ".repeat(comment.length));
const tailwindImportPattern =
  /@import\s+(["'])tailwindcss(?:\/(?:theme|preflight|utilities)\.css)?\1[^;]*;/;
const hasTailwindImport = (css: string) => tailwindImportPattern.test(activeCss(css));
const hasRocketiconsPlugin = (css: string) =>
  /@plugin\s+(["'])@rocketicons\/tailwind\1\s*;?/.test(activeCss(css));
const stylesheetLoaded = (root: string, stylesheetPath: string, files: string[]) => {
  const target = safePath(root, stylesheetPath);
  for (const rel of files.filter((file) => /\.(?:[cm]?[jt]sx?|html)$/.test(file))) {
    const source = existing(root, rel) ?? "";
    for (const match of source.matchAll(
      /\bimport\s+(?:[^"']*?\s+from\s+)?["']([^"']+\.css)["']/g
    )) {
      const spec = match[1];
      const candidate = spec.startsWith("@/")
        ? resolve(root, "src", spec.slice(2))
        : spec.startsWith("/")
          ? resolve(root, spec.slice(1))
          : resolve(dirname(safePath(root, rel)), spec);
      if (candidate === target) return true;
    }
    if (rel.endsWith(".html") && source.includes(stylesheetPath)) return true;
  }
  return false;
};
const tailwindIntegration = (root: string) => {
  const pkg = JSON.parse(readFileSync(safePath(root, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const configs = readdirSync(root).filter((name) =>
    /^(?:vite|postcss)\.config\.[cm]?[jt]s$/.test(name)
  );
  for (const name of configs) {
    const source = existing(root, name) ?? "";
    if (name.startsWith("vite") && source.includes("@tailwindcss/vite"))
      return deps["@tailwindcss/vite"] ? "vite" : "missing @tailwindcss/vite dependency";
    if (name.startsWith("postcss") && source.includes("@tailwindcss/postcss"))
      return deps["@tailwindcss/postcss"] ? "postcss" : "missing @tailwindcss/postcss dependency";
  }
  return null;
};
const selectStylesheet = (root: string, requestedPath?: string) => {
  const files = projectFiles(root);
  if (requestedPath) {
    const absolute = safePath(root, requestedPath);
    const rel = relative(root, absolute).replace(/\\/g, "/");
    if (!rel.endsWith(".css") || !existsSync(absolute) || !lstatSync(absolute).isFile())
      throw new Error(
        `stylesheet_path must be an existing CSS file in the project: ${requestedPath}`
      );
    if (!hasTailwindImport(existing(root, rel) ?? ""))
      throw new Error(`Tailwind stylesheet ${rel} must import tailwindcss`);
    return { path: rel, files };
  }
  const candidates = files.filter(
    (file) => file.endsWith(".css") && hasTailwindImport(existing(root, file) ?? "")
  );
  const loaded = candidates.filter((file) => stylesheetLoaded(root, file, files));
  const choices = loaded.length ? loaded : candidates;
  if (!choices.length)
    throw new Error(
      'No Tailwind stylesheet found; add @import "tailwindcss" to a CSS file loaded by the app'
    );
  if (choices.length > 1)
    throw new Error(
      `Multiple Tailwind stylesheets found (${choices.join(", ")}); pass stylesheet_path`
    );
  return { path: choices[0], files };
};
const tailwindStyleEdit = (root: string, target: Target, requestedPath?: string) => {
  if (target !== "react" || tailwindMajor(root) !== 4) return undefined;
  const selected = selectStylesheet(root, requestedPath);
  const previous = existing(root, selected.path)!;
  if (hasRocketiconsPlugin(previous)) return { path: selected.path, next: previous };
  const importMatch = tailwindImportPattern.exec(activeCss(previous));
  if (!importMatch)
    throw new Error(`Tailwind stylesheet ${selected.path} must import tailwindcss`);
  const offset = importMatch.index + importMatch[0].length;
  const next = `${previous.slice(0, offset)}\n@plugin "@rocketicons/tailwind";${previous.slice(offset)}`;
  return { path: selected.path, next };
};
const fileChange = (root: string, rel: string, next?: string): Change | undefined => {
  const old = existing(root, rel);
  if (next === undefined) return old === undefined ? undefined : { path: rel, action: "delete" };
  if (old === next) return undefined;
  return { path: rel, action: old === undefined ? "create" : "update" };
};
const atomicWrite = async (root: string, rel: string, content: string) => {
  const path = safePath(root, rel);
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.rocketicons-${process.pid}-${Math.random().toString(36).slice(2)}`;
  try {
    await writeFile(temp, content, "utf8");
    await rename(temp, path);
  } finally {
    await rm(temp, { force: true });
  }
};
const readManifest = (root: string): ProjectManifest | undefined => {
  const content = existing(root, "rocketicons.json");
  if (!content) return undefined;
  const manifest = JSON.parse(content) as ProjectManifest;
  if (manifest.schemaVersion !== 1 || manifest.outputPath !== "src/ri" || !manifest.icons)
    throw new Error("Unsupported rocketicons.json schema");
  if (
    !["react", "react-native"].includes(manifest.target) ||
    !["ts", "js"].includes(manifest.language)
  )
    throw new Error("Invalid Rocketicons target or language in manifest");
  for (const [id, record] of Object.entries(manifest.icons)) {
    const icon = requireIcon(id);
    if (
      record.collection !== icon.collection ||
      record.path !== iconFile(icon.id, icon.collection, manifest.language)
    )
      throw new Error(`Invalid manifest entry for ${id}`);
    safePath(root, record.path);
  }
  if (manifest.stylesheetPath) safePath(root, manifest.stylesheetPath);
  return manifest;
};
const detectTarget = (root: string): Target => {
  const pkg = JSON.parse(readFileSync(safePath(root, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return deps["react-native"] || deps.expo ? "react-native" : "react";
};
const detectLanguage = (root: string): Language =>
  existsSync(join(root, "tsconfig.json")) ? "ts" : "js";
const detectPackageManager = (root: string) => {
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "bun.lock")) || existsSync(join(root, "bun.lockb"))) return "bun";
  return "npm";
};
const compatibleRuntime = (version: unknown) => {
  if (typeof version !== "string") return false;
  if (/^(workspace:|file:|link:)/.test(version)) return true;
  const parsed = /^(?:\^|~|>=)?(\d+)(?:\.(\d+))?/.exec(version);
  if (!parsed) return false;
  return Number(parsed[1]) > 0 || Number(parsed[2] ?? 0) >= 7;
};
const requiredDependencies = (target: Target) => [
  "@rocketicons/utils",
  "@rocketicons/tailwind",
  ...(target === "react-native" ? ["nativewind", "react-native-svg"] : [])
];
const dependenciesToInstall = (root: string, target: Target) => {
  const pkg = JSON.parse(readFileSync(safePath(root, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return requiredDependencies(target).filter(
    (name) => !deps[name] || (name.startsWith("@rocketicons/") && !compatibleRuntime(deps[name]))
  );
};
const requestedPackage = (name: string) =>
  name.startsWith("@rocketicons/") ? `${name}@^0.7.0` : name;
const installArgs = (manager: string, needed: string[]) => {
  const packages = needed.map(requestedPackage);
  return manager === "npm"
    ? ["install", "--save", "--ignore-scripts", ...packages]
    : ["add", ...packages, "--ignore-scripts"];
};
const lockfilePath = (root: string, manager: string) =>
  manager === "pnpm"
    ? "pnpm-lock.yaml"
    : manager === "yarn"
      ? "yarn.lock"
      : manager === "bun"
        ? existsSync(join(root, "bun.lockb"))
          ? "bun.lockb"
          : "bun.lock"
        : "package-lock.json";
const configText = (root: string, language: Language) => {
  const rel = language === "ts" ? "tsconfig.json" : "jsconfig.json";
  const previous = existing(root, rel) ?? "{}\n";
  const parsed = parse(previous) as Record<string, unknown> | undefined;
  const compiler =
    parsed &&
    typeof parsed === "object" &&
    parsed.compilerOptions &&
    typeof parsed.compilerOptions === "object"
      ? (parsed.compilerOptions as Record<string, unknown>)
      : {};
  const paths = (compiler.paths ?? {}) as Record<string, unknown>;
  if (paths["@/ri/*"] && JSON.stringify(paths["@/ri/*"]) !== JSON.stringify(["./src/ri/*"]))
    throw new Error("Existing @/ri/* alias conflicts with Rocketicons setup");
  let next = previous;
  const options = { formattingOptions: { insertSpaces: true, tabSize: 2 } };
  if (!compiler.baseUrl)
    next = applyEdits(next, modify(next, ["compilerOptions", "baseUrl"], ".", options));
  next = applyEdits(
    next,
    modify(next, ["compilerOptions", "paths", "@/ri/*"], ["./src/ri/*"], options)
  );
  return { rel, next };
};
const iconFile = (id: string, collection: string, language: Language) =>
  `src/ri/icons/${isCollidingId(id) ? `${collection}-${id}` : id}.${language === "ts" ? "tsx" : "jsx"}`;
const componentSource = (id: string, language: Language) => {
  const icon = requireIcon(id);
  const tree = localIconTree(icon);
  const typeImport = language === "ts" ? 'import type { IconProps } from "../core";\n' : "";
  const type = language === "ts" ? ": IconProps" : "";
  return `// Generated by Rocketicons. Icon: ${icon.id}; collection: ${icon.collection}; catalog: ${catalogVersion}; license: ${getCollection(icon.collection)!.licenseUrl}\nimport { IconGenerator } from "../core";\n${typeImport}\nexport function ${icon.component}(props${type}) {\n  return IconGenerator(${JSON.stringify(tree, null, 2)}, ${JSON.stringify(icon.variant)}, ${JSON.stringify(icon.id)})(props);\n}\n\nexport default ${icon.component};\n`;
};
const template = (name: string, language: Language) =>
  readFileSync(
    join(__dirname, "..", "templates", `${name}.${language === "ts" ? "tsx" : "jsx"}`),
    "utf8"
  );
const runInstall = async (root: string, manager: string, needed: string[]) => {
  const args = installArgs(manager, needed);
  await new Promise<void>((done, reject) => {
    const child = spawn(manager, args, {
      cwd: root,
      shell: false,
      stdio: ["ignore", "ignore", "pipe"],
      env: {
        ...process.env,
        npm_config_cache: join(root, ".rocketicons-cache"),
        npm_config_ignore_scripts: "true",
        XDG_CACHE_HOME: join(root, ".rocketicons-cache"),
        YARN_CACHE_FOLDER: join(root, ".rocketicons-cache", "yarn"),
        YARN_ENABLE_SCRIPTS: "false",
        BUN_INSTALL_CACHE_DIR: join(root, ".rocketicons-cache", "bun")
      }
    });
    let errors = "";
    child.stderr.on("data", (data) => (errors += String(data).slice(0, 4000)));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? done() : reject(new Error(`${manager} install failed: ${errors.trim()}`))
    );
  });
};

export const inspectProject = (projectPath: string) => {
  const root = projectRoot(projectPath);
  const manifest = readManifest(root);
  const installedIconStatus: Record<string, "current" | "missing" | "modified"> = {};
  for (const [id, record] of Object.entries(manifest?.icons ?? {})) {
    const content = existing(root, record.path);
    installedIconStatus[id] =
      content === undefined ? "missing" : sha(content) === record.sha256 ? "current" : "modified";
  }
  return {
    projectPath: root,
    initialized: Boolean(manifest),
    manifest,
    installedIconStatus,
    detectedTarget: detectTarget(root),
    detectedLanguage: detectLanguage(root),
    packageManager: detectPackageManager(root)
  };
};
export const doctor = (projectPath: string) => {
  const project = inspectProject(projectPath);
  const issues: string[] = [];
  if (!project.manifest) issues.push("Project is not initialized; run init_project");
  else {
    if (project.manifest.catalogVersion !== catalogVersion)
      issues.push(
        `Project catalog ${project.manifest.catalogVersion} differs from installed catalog ${catalogVersion}`
      );
    for (const id of Object.keys(project.manifest.icons)) {
      if (project.installedIconStatus[id] === "missing")
        issues.push(`Missing generated file for ${id}`);
      else if (project.installedIconStatus[id] === "modified")
        issues.push(`Generated file modified: ${id}`);
    }
  }
  const pkg = JSON.parse(readFileSync(safePath(project.projectPath, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of requiredDependencies(project.manifest?.target ?? project.detectedTarget)) {
    if (!deps[name]) issues.push(`Missing dependency: ${name}`);
    else if (name.startsWith("@rocketicons/") && !compatibleRuntime(deps[name]))
      issues.push(`Incompatible dependency: ${name} requires version 0.7.0 or newer`);
  }
  const target = project.manifest?.target ?? project.detectedTarget;
  let styling: {
    tailwindMajor: number | null;
    stylesheetPath: string | null;
    pluginRegistered: boolean;
    stylesheetLoaded: boolean;
    buildIntegration: string | null;
  } | null = null;
  if (target === "react") {
    const major = tailwindMajor(project.projectPath);
    const integration = tailwindIntegration(project.projectPath);
    styling = {
      tailwindMajor: Number.isNaN(major) ? null : major,
      stylesheetPath: null,
      pluginRegistered: false,
      stylesheetLoaded: false,
      buildIntegration: integration
    };
    if (major !== 4)
      issues.push(
        `Tailwind CSS 4 is required for automatic web styling; found ${Number.isNaN(major) ? "no declared version" : `version ${major}`}. Install tailwindcss@^4 and configure its build integration.`
      );
    else {
      try {
        const selected = selectStylesheet(project.projectPath, project.manifest?.stylesheetPath);
        styling.stylesheetPath = selected.path;
        styling.pluginRegistered = hasRocketiconsPlugin(
          existing(project.projectPath, selected.path) ?? ""
        );
        styling.stylesheetLoaded = stylesheetLoaded(
          project.projectPath,
          selected.path,
          selected.files
        );
        if (!styling.pluginRegistered)
          issues.push(
            `Tailwind stylesheet ${selected.path} is missing @plugin "@rocketicons/tailwind"; run init_project.`
          );
        if (!styling.stylesheetLoaded)
          issues.push(
            `Tailwind stylesheet ${selected.path} is not loaded by an application source file; import it from your app entry.`
          );
      } catch (error) {
        issues.push(error instanceof Error ? error.message : String(error));
      }
      if (integration === null)
        issues.push(
          "Tailwind 4 build integration is missing; configure @tailwindcss/vite in vite.config.* or @tailwindcss/postcss in postcss.config.*."
        );
      else if (integration.startsWith("missing "))
        issues.push(`Tailwind 4 build integration: ${integration}; install it in package.json.`);
    }
  }
  return { ...project, healthy: issues.length === 0, issues, styling };
};

export const initProject = async (
  projectPath: string,
  options: {
    target?: Target;
    language?: Language;
    packageManager?: string;
    stylesheetPath?: string;
    dryRun?: boolean;
  } = {}
): Promise<MutationResult> => {
  const root = projectRoot(projectPath);
  const prior = readManifest(root);
  const target = options.target ?? prior?.target ?? detectTarget(root);
  const language = options.language ?? prior?.language ?? detectLanguage(root);
  if (prior && (prior.target !== target || prior.language !== language))
    throw new Error("Existing Rocketicons setup uses a different target or language");
  const manager = options.packageManager ?? detectPackageManager(root);
  if (!["npm", "pnpm", "yarn", "bun"].includes(manager))
    throw new Error(`Unsupported package manager: ${manager}`);
  const core = template("index", language);
  const native = template("index.native", language);
  const coreRel = `src/ri/core/index.${language === "ts" ? "tsx" : "jsx"}`;
  const nativeRel = `src/ri/core/index.native.${language === "ts" ? "tsx" : "jsx"}`;
  const files = [
    [coreRel, core],
    [nativeRel, native]
  ] as const;
  for (const [rel, content] of files) {
    const old = existing(root, rel);
    if (old !== undefined && old !== content)
      throw new Error(`Existing core file was modified: ${rel}`);
  }
  const config = configText(root, language);
  const stylesheet = tailwindStyleEdit(
    root,
    target,
    options.stylesheetPath ?? prior?.stylesheetPath
  );
  const manifest: ProjectManifest = prior ?? {
    schemaVersion: 1,
    catalogVersion,
    target,
    language,
    outputPath: "src/ri",
    icons: {}
  };
  if (stylesheet) manifest.stylesheetPath = stylesheet.path;
  const changes = [
    ...files.map(([rel, content]) => fileChange(root, rel, content)),
    fileChange(root, config.rel, config.next),
    ...(stylesheet ? [fileChange(root, stylesheet.path, stylesheet.next)] : []),
    fileChange(root, "rocketicons.json", json(manifest))
  ].filter(Boolean) as Change[];
  const needed = dependenciesToInstall(root, target);
  if (needed.length)
    changes.push({
      path: `package.json + ${manager} lockfile (${needed.join(", ")})`,
      action: "dependency-install"
    });
  if (!options.dryRun) {
    if (needed.length) await runInstall(root, manager, needed);
    for (const [rel, content] of files)
      if (fileChange(root, rel, content)) await atomicWrite(root, rel, content);
    if (fileChange(root, config.rel, config.next))
      await atomicWrite(root, config.rel, config.next);
    if (stylesheet && fileChange(root, stylesheet.path, stylesheet.next))
      await atomicWrite(root, stylesheet.path, stylesheet.next);
    if (fileChange(root, "rocketicons.json", json(manifest)))
      await atomicWrite(root, "rocketicons.json", json(manifest));
  }
  return {
    projectPath: root,
    dryRun: Boolean(options.dryRun),
    changes,
    summary: changes.length
      ? "Rocketicons project setup planned"
      : "Rocketicons project already initialized"
  };
};

export const addIcons = async (
  projectPath: string,
  iconIds: string[],
  dryRun = false
): Promise<MutationResult> => {
  if (!iconIds.length) throw new Error("At least one icon ID is required");
  const root = projectRoot(projectPath);
  const manifest = readManifest(root);
  if (!manifest) throw new Error("Project is not initialized; run init_project first");
  if (manifest.catalogVersion !== catalogVersion)
    throw new Error("Project catalog version differs from installed catalog");
  const next: ProjectManifest = JSON.parse(JSON.stringify(manifest));
  const writes: Array<{ rel: string; content: string }> = [];
  for (const id of [...new Set(iconIds)]) {
    const icon = requireIcon(id);
    const rel = iconFile(icon.id, icon.collection, manifest.language);
    const content = componentSource(`@${icon.collection}/${icon.id}`, manifest.language);
    const current = existing(root, rel);
    const qualified = `@${icon.collection}/${icon.id}`;
    const recorded = manifest.icons[qualified];
    if (current !== undefined && (!recorded || sha(current) !== recorded.sha256))
      throw new Error(`Refusing to overwrite unmanaged or edited file: ${rel}`);
    next.icons[qualified] = {
      component: icon.component,
      path: rel,
      sha256: sha(content),
      collection: icon.collection,
      licenseUrl: getCollection(icon.collection)!.licenseUrl
    };
    if (current !== content) writes.push({ rel, content });
  }
  const changes = [
    ...writes.map(({ rel, content }) => fileChange(root, rel, content)!),
    fileChange(root, "rocketicons.json", json(next))
  ].filter(Boolean) as Change[];
  if (!dryRun) {
    for (const { rel, content } of writes) await atomicWrite(root, rel, content);
    if (fileChange(root, "rocketicons.json", json(next)))
      await atomicWrite(root, "rocketicons.json", json(next));
  }
  return {
    projectPath: root,
    dryRun,
    changes,
    summary: `${writes.length} icon component(s) ${dryRun ? "planned" : "added"}`
  };
};

export const removeIcons = async (
  projectPath: string,
  iconIds: string[],
  dryRun = false
): Promise<MutationResult> => {
  if (!iconIds.length) throw new Error("At least one icon ID is required");
  const root = projectRoot(projectPath);
  const manifest = readManifest(root);
  if (!manifest) throw new Error("Project is not initialized; run init_project first");
  const next: ProjectManifest = JSON.parse(JSON.stringify(manifest));
  const removals: string[] = [];
  for (const raw of [...new Set(iconIds)]) {
    const icon = requireIcon(raw);
    const id = `@${icon.collection}/${icon.id}`;
    const recorded = manifest.icons[id];
    if (!recorded) continue;
    const rel = recorded.path;
    const current = existing(root, rel);
    if (current && sha(current) !== recorded.sha256)
      throw new Error(`Refusing to remove edited file: ${rel}`);
    if (current) removals.push(rel);
    delete next.icons[id];
  }
  const changes = [
    ...removals.map((rel): Change => ({ path: rel, action: "delete" })),
    fileChange(root, "rocketicons.json", json(next))
  ].filter(Boolean) as Change[];
  if (!dryRun) {
    for (const rel of removals) await rm(safePath(root, rel));
    if (fileChange(root, "rocketicons.json", json(next)))
      await atomicWrite(root, "rocketicons.json", json(next));
  }
  return {
    projectPath: root,
    dryRun,
    changes,
    summary: `${removals.length} icon component(s) ${dryRun ? "planned for removal" : "removed"}`
  };
};

export const iconUsage = (
  id: string,
  target: Target,
  language: Language = "ts",
  origin?: { projectPath: string; fromFile: string }
) => {
  const icon = requireIcon(id);
  const generatedPath = iconFile(icon.id, icon.collection, language);
  let importStatement: string | null = null;
  let fromFile: string | null = null;
  if (origin) {
    const root = projectRoot(origin.projectPath);
    const source = safePath(root, origin.fromFile);
    if (!existsSync(source) || !lstatSync(source).isFile())
      throw new Error("from_file must identify an existing source file in the project");
    const destination = safePath(root, generatedPath);
    const relativeModule = relative(dirname(source), destination)
      .replace(/\\/g, "/")
      .replace(/\.(tsx|jsx)$/, "");
    const specifier = relativeModule.startsWith(".") ? relativeModule : `./${relativeModule}`;
    importStatement = `import ${icon.component} from ${JSON.stringify(specifier)};`;
    fromFile = relative(root, source).replace(/\\/g, "/");
  }
  return {
    ...iconSummary(icon),
    target,
    language,
    generatedPath,
    fromFile,
    importStatement,
    importHint: origin
      ? null
      : "Pass project_path and from_file to get an import that resolves from your source file",
    example: `<${icon.component} className="icon-primary-xl" />`
  };
};

export type IconPlanOptions = {
  fromFile: string;
  target?: Target;
  language?: Language;
  packageManager?: string;
  stylesheetPath?: string;
};

const plannedFile = (root: string, path: string, content: string) => {
  const before = existing(root, path);
  if (before === content) return undefined;
  return {
    path,
    action: before === undefined ? ("create" as const) : ("update" as const),
    beforeSha256: before === undefined ? null : sha(before),
    afterSha256: sha(content),
    afterBytes: Buffer.byteLength(content)
  };
};
const fileDigest = (root: string, path: string) => {
  const absolute = safePath(root, path);
  return existsSync(absolute) ? sha(readFileSync(absolute)) : null;
};

export const planIcons = async (
  projectPath: string,
  iconIds: string[],
  options: IconPlanOptions
) => {
  if (!iconIds.length) throw new Error("At least one icon ID is required");
  if (!options.fromFile) throw new Error("from_file is required for a resolvable import");
  const root = projectRoot(projectPath);
  const sourcePath = safePath(root, options.fromFile);
  if (!existsSync(sourcePath) || !lstatSync(sourcePath).isFile())
    throw new Error("from_file must identify an existing source file in the project");
  const fromFile = relative(root, sourcePath).replace(/\\/g, "/");
  if (!/\.[cm]?[jt]sx?$/.test(fromFile))
    throw new Error("from_file must be a JavaScript or TypeScript source file");
  const prior = readManifest(root);
  const target = options.target ?? prior?.target ?? detectTarget(root);
  const language = options.language ?? prior?.language ?? detectLanguage(root);
  const packageManager = options.packageManager ?? detectPackageManager(root);
  const stylesheet = tailwindStyleEdit(
    root,
    target,
    options.stylesheetPath ?? prior?.stylesheetPath
  );
  await initProject(root, {
    target,
    language,
    packageManager,
    stylesheetPath: stylesheet?.path,
    dryRun: true
  });
  if (prior && prior.catalogVersion !== catalogVersion)
    throw new Error("Project catalog version differs from installed catalog");

  const icons = [
    ...new Map(
      iconIds.map((raw) => {
        const icon = requireIcon(raw);
        return [`@${icon.collection}/${icon.id}`, icon] as const;
      })
    ).values()
  ];
  const next: ProjectManifest = prior
    ? JSON.parse(JSON.stringify(prior))
    : { schemaVersion: 1, catalogVersion, target, language, outputPath: "src/ri", icons: {} };
  if (stylesheet) next.stylesheetPath = stylesheet.path;
  const files = new Map<string, string>();
  for (const name of ["index", "index.native"])
    files.set(
      `src/ri/core/${name}.${language === "ts" ? "tsx" : "jsx"}`,
      template(name, language)
    );
  const config = configText(root, language);
  files.set(config.rel, config.next);
  if (stylesheet) files.set(stylesheet.path, stylesheet.next);
  for (const icon of icons) {
    const id = `@${icon.collection}/${icon.id}`;
    const path = iconFile(icon.id, icon.collection, language);
    const content = componentSource(id, language);
    const current = existing(root, path);
    const recorded = prior?.icons[id];
    if (current !== undefined && (!recorded || sha(current) !== recorded.sha256))
      throw new Error(`Refusing to overwrite unmanaged or edited file: ${path}`);
    next.icons[id] = {
      component: icon.component,
      path,
      sha256: sha(content),
      collection: icon.collection,
      licenseUrl: getCollection(icon.collection)!.licenseUrl
    };
    files.set(path, content);
  }
  files.set("rocketicons.json", json(next));
  const fileChanges = [...files]
    .map(([path, content]) => plannedFile(root, path, content))
    .filter((change): change is NonNullable<typeof change> => Boolean(change));
  const dependencies = requiredDependencies(target);
  const toInstall = dependenciesToInstall(root, target);
  const dependencyEffects = toInstall.length
    ? {
        command: [packageManager, ...installArgs(packageManager, toInstall)],
        mayWritePaths: [
          "package.json",
          lockfilePath(root, packageManager),
          "node_modules/",
          ".rocketicons-cache/"
        ],
        beforeSha256: Object.fromEntries(
          ["package.json", lockfilePath(root, packageManager)].map((path) => [
            path,
            fileDigest(root, path)
          ])
        )
      }
    : null;
  const imports = icons.map((icon) => {
    const id = `@${icon.collection}/${icon.id}`;
    const { generatedPath, importStatement, example } = iconUsage(id, target, language, {
      projectPath: root,
      fromFile
    });
    return { id, component: icon.component, generatedPath, importStatement, example };
  });
  const planCore = {
    projectPath: root,
    catalogVersion,
    iconIds: icons.map((icon) => `@${icon.collection}/${icon.id}`),
    initialized: Boolean(prior),
    target,
    language,
    packageManager,
    fromFile,
    stylesheetPath: stylesheet?.path ?? null,
    packageJsonSha256: sha(readFileSync(safePath(root, "package.json"))),
    dependencies,
    toInstall: toInstall.map(requestedPackage),
    dependencyEffects,
    fileChanges,
    imports
  };
  return {
    ...planCore,
    planId: sha(json(planCore)),
    summary: `${fileChanges.length} managed file change(s) planned; ${toInstall.length} dependency install(s)`
  };
};

export const applyIconPlan = async (
  projectPath: string,
  iconIds: string[],
  planId: string,
  options: IconPlanOptions & { dryRun?: boolean }
) => {
  const plan = await planIcons(projectPath, iconIds, options);
  if (plan.planId !== planId)
    throw new Error("Plan is stale or does not match these inputs; call plan_icons again");
  if (options.dryRun) return { ...plan, dryRun: true, verification: null };

  await initProject(plan.projectPath, {
    target: plan.target,
    language: plan.language,
    packageManager: plan.packageManager,
    stylesheetPath: plan.stylesheetPath ?? undefined
  });
  await addIcons(plan.projectPath, plan.iconIds);
  const health = doctor(plan.projectPath);
  const mismatchedFiles = plan.fileChanges
    .filter(({ path, afterSha256 }) => {
      const content = existing(plan.projectPath, path);
      return content === undefined || sha(content) !== afterSha256;
    })
    .map(({ path }) => path);
  const issues = [
    ...health.issues,
    ...mismatchedFiles.map((path) => `Applied file differs from plan: ${path}`)
  ];
  const dependencyFileChanges = plan.dependencyEffects
    ? Object.entries(plan.dependencyEffects.beforeSha256)
        .map(([path, beforeSha256]) => {
          const afterSha256 = fileDigest(plan.projectPath, path);
          return beforeSha256 === afterSha256
            ? undefined
            : {
                path,
                action: beforeSha256 === null ? ("create" as const) : ("update" as const),
                beforeSha256,
                afterSha256
              };
        })
        .filter((change): change is NonNullable<typeof change> => Boolean(change))
    : [];
  return {
    ...plan,
    dryRun: false,
    summary: issues.length
      ? `Applied ${plan.iconIds.length} icon(s) with ${issues.length} verification issue(s)`
      : `Applied and verified ${plan.iconIds.length} icon(s)`,
    verification: { healthy: issues.length === 0, issues },
    appliedFileChanges: [...plan.fileChanges, ...dependencyFileChanges],
    dependencyFileChanges,
    dependencyEffects: plan.dependencyEffects
  };
};
