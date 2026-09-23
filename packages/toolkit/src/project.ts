import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
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

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
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
    if (existsSync(part) && lstatSync(part).isSymbolicLink())
      throw new Error(`Symlink is not allowed in managed path: ${relative(root, part)}`);
  }
  return path;
};
const existing = (root: string, rel: string) => {
  const path = safePath(root, rel);
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
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
  const packages = needed.map((name) =>
    name.startsWith("@rocketicons/") ? `${name}@^0.7.0` : name
  );
  const args =
    manager === "yarn"
      ? ["add", ...packages, "--ignore-scripts"]
      : manager === "bun"
        ? ["add", ...packages, "--ignore-scripts"]
        : manager === "pnpm"
          ? ["add", ...packages, "--ignore-scripts"]
          : ["install", "--save", "--ignore-scripts", ...packages];
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
  return {
    projectPath: root,
    initialized: Boolean(manifest),
    manifest,
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
    for (const [id, record] of Object.entries(project.manifest.icons)) {
      const content = existing(project.projectPath, record.path);
      if (!content) issues.push(`Missing generated file for ${id}`);
      else if (sha(content) !== record.sha256) issues.push(`Generated file modified: ${id}`);
    }
  }
  const pkg = JSON.parse(readFileSync(safePath(project.projectPath, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of [
    "@rocketicons/utils",
    "@rocketicons/tailwind",
    ...(project.manifest?.target === "react-native" ? ["nativewind", "react-native-svg"] : [])
  ]) {
    if (!deps[name]) issues.push(`Missing dependency: ${name}`);
    else if (name.startsWith("@rocketicons/") && !compatibleRuntime(deps[name]))
      issues.push(`Incompatible dependency: ${name} requires version 0.7.0 or newer`);
  }
  return { ...project, healthy: issues.length === 0, issues };
};

export const initProject = async (
  projectPath: string,
  options: {
    target?: Target;
    language?: Language;
    packageManager?: string;
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
  const manifest: ProjectManifest = prior ?? {
    schemaVersion: 1,
    catalogVersion,
    target,
    language,
    outputPath: "src/ri",
    icons: {}
  };
  const changes = [
    ...files.map(([rel, content]) => fileChange(root, rel, content)),
    fileChange(root, config.rel, config.next),
    fileChange(root, "rocketicons.json", json(manifest))
  ].filter(Boolean) as Change[];
  const pkg = JSON.parse(readFileSync(safePath(root, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const needed = [
    "@rocketicons/utils",
    "@rocketicons/tailwind",
    ...(target === "react-native" ? ["nativewind", "react-native-svg"] : [])
  ].filter(
    (name) => !deps[name] || (name.startsWith("@rocketicons/") && !compatibleRuntime(deps[name]))
  );
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

export const iconUsage = (id: string, target: Target, language: Language = "ts") => {
  const icon = requireIcon(id);
  return {
    ...iconSummary(icon),
    target,
    language,
    generatedPath: iconFile(icon.id, icon.collection, language),
    importStatement: `import ${icon.component} from "@/ri/icons/${isCollidingId(icon.id) ? `${icon.collection}-${icon.id}` : icon.id}";`,
    example: `<${icon.component} className="icon-primary-xl" />`
  };
};
