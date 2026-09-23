const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
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
      /Refusing to overwrite unmanaged or edited file/
    );
    assert.equal(fs.readFileSync(file, "utf8"), "// user owned icon\n");
    assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
