const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHash } = require("node:crypto");
const ts = require("typescript");
const app = require("../dist");

const fixture = (language = "ts", target = "react", dependencies = true) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-plan-"));
  const extension = language === "ts" ? "tsx" : "jsx";
  const source =
    target === "react" ? `src/components/Navigation.${extension}` : `App.${extension}`;
  fs.mkdirSync(path.dirname(path.join(root, source)), { recursive: true });
  fs.writeFileSync(
    path.join(root, source),
    "export default function Navigation() { return null; }\n"
  );
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({
      name: "vite-without-alias",
      version: "1",
      dependencies: {
        ...(dependencies ? { "@rocketicons/utils": "1", "@rocketicons/tailwind": "1" } : {}),
        ...(target === "react" ? { tailwindcss: "^4.2.1", "@tailwindcss/vite": "^4.2.1" } : {}),
        ...(target === "react-native"
          ? { "react-native": "1", nativewind: "1", "react-native-svg": "1" }
          : {})
      }
    })
  );
  if (language === "ts") fs.writeFileSync(path.join(root, "tsconfig.json"), "{}");
  if (target === "react") {
    fs.writeFileSync(
      path.join(root, "vite.config.js"),
      'import tailwindcss from "@tailwindcss/vite";\nexport default { plugins: [tailwindcss()] };\n'
    );
    fs.writeFileSync(path.join(root, "src/index.css"), '@import "tailwindcss";\n');
    fs.writeFileSync(path.join(root, "src/main.jsx"), 'import "./index.css";\n');
  }
  return { root, source };
};

for (const language of ["ts", "js"])
  for (const target of ["react", "react-native"])
    test(`${language} ${target}: plan, dry run, apply, and verify relative imports`, async () => {
      const { root, source } = fixture(language, target);
      const ids = ["@fi/fi-calendar", "@fi/fi-camera"];
      try {
        const plan = await app.planIcons(root, ids, { fromFile: source });
        assert.equal(plan.initialized, false);
        assert.deepEqual(plan.toInstall, []);
        assert.equal(plan.dependencyEffects, null);
        assert.deepEqual(plan.iconIds, ids);
        assert.ok(plan.fileChanges.some(({ path }) => path === "rocketicons.json"));
        assert.ok(
          plan.fileChanges.some(({ path }) =>
            path.endsWith(`fi-calendar.${language === "ts" ? "tsx" : "jsx"}`)
          )
        );
        assert.ok(
          plan.fileChanges.every(({ afterSha256 }) => /^[a-f0-9]{64}$/.test(afterSha256))
        );
        assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
        const dry = await app.applyIconPlan(root, ids, plan.planId, {
          fromFile: source,
          dryRun: true
        });
        assert.equal(dry.dryRun, true);
        assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);

        const applied = await app.applyIconPlan(root, ids, plan.planId, { fromFile: source });
        assert.equal(applied.verification.healthy, true);
        assert.equal(app.doctor(root).healthy, true);
        assert.equal(applied.appliedFileChanges.length, plan.fileChanges.length);
        for (const entry of applied.imports) {
          assert.ok(entry.importStatement.startsWith(`import ${entry.component} from ".`));
          assert.doesNotMatch(entry.importStatement, /@\/ri/);
          const specifier = entry.importStatement.match(/from "([^"]+)"/)[1];
          const resolved = ts.resolveModuleName(
            specifier,
            path.join(root, source),
            {
              allowJs: true,
              jsx: ts.JsxEmit.ReactJSX,
              moduleResolution: ts.ModuleResolutionKind.Bundler
            },
            ts.sys
          ).resolvedModule;
          assert.equal(resolved.resolvedFileName, path.join(root, entry.generatedPath));
        }
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    });

test("plan lists dependency installation effects without writing", async () => {
  const { root, source } = fixture("ts", "react", false);
  try {
    const plan = await app.planIcons(root, ["@fi/fi-calendar"], { fromFile: source });
    assert.deepEqual(plan.toInstall, [
      "@rocketicons/utils@^0.7.0",
      "@rocketicons/tailwind@^0.7.0"
    ]);
    assert.deepEqual(plan.dependencyEffects.command, [
      "npm",
      "install",
      "--save",
      "--ignore-scripts",
      ...plan.toInstall
    ]);
    assert.deepEqual(plan.dependencyEffects.mayWritePaths, [
      "package.json",
      "package-lock.json",
      "node_modules/",
      ".rocketicons-cache/"
    ]);
    assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

for (const workspaceFile of ["package.json", "pnpm-workspace.yaml"])
  test(`nested ${workspaceFile} workspace rejects dependency installation before writing`, async () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-workspace-"));
    const root = path.join(parent, "packages/app");
    const source = "src/App.tsx";
    try {
      fs.mkdirSync(path.join(root, "src"), { recursive: true });
      fs.writeFileSync(path.join(root, source), "export default function App() { return null; }\n");
      fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "app", version: "1" }));
      if (workspaceFile === "package.json")
        fs.writeFileSync(
          path.join(parent, workspaceFile),
          JSON.stringify({ name: "workspace", private: true, workspaces: ["packages/*"] })
        );
      else fs.writeFileSync(path.join(parent, workspaceFile), "packages:\n  - packages/*\n");
      const before = fs.readFileSync(path.join(root, "package.json"), "utf8");
      await assert.rejects(app.initProject(root, { dryRun: true }), /parent workspace/);
      await assert.rejects(app.initProject(root), /parent workspace/);
      await assert.rejects(
        app.planIcons(root, ["@fi/fi-calendar"], { fromFile: source }),
        /parent workspace/
      );
      assert.equal(fs.readFileSync(path.join(root, "package.json"), "utf8"), before);
      assert.equal(fs.existsSync(path.join(parent, "package-lock.json")), false);
      assert.equal(fs.existsSync(path.join(parent, "node_modules")), false);
      assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);

      fs.writeFileSync(
        path.join(root, "package.json"),
        JSON.stringify({
          name: "app",
          version: "1",
          dependencies: { "@rocketicons/utils": "1", "@rocketicons/tailwind": "1" }
        })
      );
      const plan = await app.planIcons(root, ["@fi/fi-calendar"], { fromFile: source });
      assert.deepEqual(plan.toInstall, []);
      const applied = await app.applyIconPlan(root, ["@fi/fi-calendar"], plan.planId, {
        fromFile: source
      });
      assert.ok(applied.appliedFileChanges.some(({ path }) => path === "src/ri/icons/fi-calendar.jsx"));
      assert.equal(fs.existsSync(path.join(root, "src/ri/icons/fi-calendar.jsx")), true);
      assert.equal(fs.existsSync(path.join(parent, "package-lock.json")), false);
      assert.equal(fs.existsSync(path.join(parent, "node_modules")), false);
    } finally {
      fs.rmSync(parent, { recursive: true, force: true });
    }
  });

test("apply rejects a stale plan before writing and rejects source paths outside the project", async () => {
  const { root, source } = fixture();
  try {
    const plan = await app.planIcons(root, ["@fi/fi-calendar"], { fromFile: source });
    fs.writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "changed",
        version: "1",
        dependencies: { "@rocketicons/utils": "1", "@rocketicons/tailwind": "1" }
      })
    );
    await assert.rejects(
      app.applyIconPlan(root, ["@fi/fi-calendar"], plan.planId, { fromFile: source }),
      /Plan is stale/
    );
    await assert.rejects(
      app.planIcons(root, ["@fi/fi-calendar"], { fromFile: "../outside.tsx" }),
      /Path escapes project/
    );
    await assert.rejects(
      app.planIcons(root, ["@fi/fi-calendar"], { fromFile: "src/Missing.tsx" }),
      /existing source file/
    );
    assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("plan refuses to overwrite an unmanaged icon file without changing it", async () => {
  const { root, source } = fixture();
  try {
    const file = path.join(root, "src/ri/icons/fi-calendar.tsx");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "// user owned icon\n");
    await assert.rejects(
      app.planIcons(root, ["@fi/fi-calendar"], { fromFile: source }),
      /Refusing to overwrite unmanaged file/
    );
    assert.equal(fs.readFileSync(file, "utf8"), "// user owned icon\n");
    assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("plan and apply preserve a customized icon while adding another", async () => {
  const { root, source } = fixture();
  try {
    await app.initProject(root);
    await app.addIcons(root, ["@fi/fi-calendar"]);
    const file = path.join(root, "src/ri/icons/fi-calendar.tsx");
    fs.appendFileSync(file, "// owned customization\n");
    const before = fs.readFileSync(file, "utf8");
    const ids = ["@fi/fi-calendar", "@fi/fi-camera"];
    const plan = await app.planIcons(root, ids, { fromFile: source });
    assert.deepEqual(
      plan.preservedIcons.map(({ id, status }) => [id, status]),
      [["@fi/fi-calendar", "customized"]]
    );
    assert.ok(plan.fileChanges.some(({ path }) => path.endsWith("fi-camera.tsx")));
    assert.ok(!plan.fileChanges.some(({ path }) => path.endsWith("fi-calendar.tsx")));
    const applied = await app.applyIconPlan(root, ids, plan.planId, { fromFile: source });
    assert.equal(applied.verification.healthy, true);
    assert.equal(fs.readFileSync(file, "utf8"), before);
    assert.deepEqual(app.doctor(root).customizedIcons, ["@fi/fi-calendar"]);
    assert.equal(app.doctor(root).healthy, true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a preserved icon changed after planning makes the plan stale", async () => {
  const { root, source } = fixture();
  try {
    await app.initProject(root);
    await app.addIcons(root, ["@fi/fi-calendar"]);
    const file = path.join(root, "src/ri/icons/fi-calendar.tsx");
    const plan = await app.planIcons(root, ["@fi/fi-calendar"], { fromFile: source });
    fs.appendFileSync(file, "// later edit\n");
    await assert.rejects(
      app.applyIconPlan(root, ["@fi/fi-calendar"], plan.planId, { fromFile: source }),
      /Plan is stale/
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("formatting a preserved icon after planning keeps the plan valid", async () => {
  const { root, source } = fixture();
  try {
    await app.initProject(root);
    await app.addIcons(root, ["@fi/fi-calendar"]);
    const file = path.join(root, "src/ri/icons/fi-calendar.tsx");
    const plan = await app.planIcons(root, ["@fi/fi-calendar"], { fromFile: source });
    const formatted = fs
      .readFileSync(file, "utf8")
      .replace('import { IconGenerator } from "../core";', "import{IconGenerator}from'../core';");
    fs.writeFileSync(file, formatted);
    const applied = await app.applyIconPlan(root, ["@fi/fi-calendar"], plan.planId, {
      fromFile: source
    });
    assert.equal(applied.verification.healthy, true);
    assert.equal(fs.readFileSync(file, "utf8"), formatted);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("format-only changes are current for new and legacy manifests", async () => {
  const { root, source } = fixture();
  try {
    await app.initProject(root);
    await app.addIcons(root, ["@fi/fi-calendar"]);
    const file = path.join(root, "src/ri/icons/fi-calendar.tsx");
    const original = fs.readFileSync(file, "utf8");
    const formatted = original.replace(
      'import { IconGenerator } from "../core";',
      "import{IconGenerator}from'../core';"
    );
    assert.notEqual(formatted, original);
    fs.writeFileSync(file, formatted);
    assert.equal(app.inspectProject(root).installedIconStatus["@fi/fi-calendar"], "current");
    assert.deepEqual((await app.addIcons(root, ["@fi/fi-calendar"])).changes, []);
    assert.equal(fs.readFileSync(file, "utf8"), formatted);

    const manifestPath = path.join(root, "rocketicons.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.icons["@fi/fi-calendar"].sha256 = createHash("sha256")
      .update(original)
      .digest("hex");
    delete manifest.icons["@fi/fi-calendar"].hashAlgorithm;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    assert.equal(app.inspectProject(root).installedIconStatus["@fi/fi-calendar"], "current");
    const plan = await app.planIcons(root, ["@fi/fi-calendar"], { fromFile: source });
    assert.equal(plan.preservedIcons[0].status, "current");
    assert.ok(!plan.fileChanges.some(({ path }) => path.endsWith("fi-calendar.tsx")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
