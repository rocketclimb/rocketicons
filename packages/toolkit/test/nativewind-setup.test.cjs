const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const app = require("../dist");
const postcss = require("postcss");
const {
  nativewindDependencies,
  tailwindConfig,
  writeNativeWindSetup
} = require("./nativewind-fixture.cjs");

const repositoryModules = path.resolve(__dirname, "../../../node_modules");

const fixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-nativewind-"));
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({
      name: "nativewind-four",
      dependencies: {
        ...nativewindDependencies,
        "@rocketicons/utils": "1",
        "@rocketicons/tailwind": "1"
      }
    })
  );
  fs.writeFileSync(path.join(root, "tsconfig.json"), "{}");
  fs.writeFileSync(
    path.join(root, "App.tsx"),
    "export default function App() { return null; }\n"
  );
  writeNativeWindSetup(root);
  return root;
};
const setDependency = (root, name, version) => {
  const packagePath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  pkg.dependencies[name] = version;
  fs.writeFileSync(packagePath, JSON.stringify(pkg));
};
const stylingIssues = (root) =>
  app.doctor(root).issues.filter((issue) => /NativeWind|Tailwind|nativewind|Babel/.test(issue));

test("NativeWind setup is planned, applied, diagnosed, and idempotent", async () => {
  const root = fixture();
  try {
    const config = path.join(root, "tailwind.config.js");
    const original = fs.readFileSync(config, "utf8");
    const preview = await app.initProject(root, { dryRun: true });
    assert.ok(
      preview.changes.some(
        ({ path, action }) => path === "tailwind.config.js" && action === "update"
      )
    );
    assert.equal(fs.readFileSync(config, "utf8"), original);
    await app.initProject(root);
    assert.equal(fs.readFileSync(config, "utf8"), tailwindConfig(true));
    const diagnosis = app.doctor(root);
    assert.equal(diagnosis.healthy, true, diagnosis.issues.join(", "));
    assert.deepEqual(diagnosis.styling, {
      tailwindMajor: 3,
      stylesheetPath: "global.css",
      pluginRegistered: true,
      stylesheetLoaded: true,
      buildIntegration: "metro",
      tailwindConfigPath: "tailwind.config.js",
      nativewindPreset: true,
      babelPreset: true
    });
    assert.equal(app.inspectProject(root).manifest.stylesheetPath, undefined);
    assert.deepEqual((await app.initProject(root, { dryRun: true })).changes, []);
    fs.writeFileSync(config, original);
    assert.match(app.doctor(root).issues.join(" "), /tailwind.config.js.*nativeIconPlugin/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the initialized Tailwind config compiles icon rules with Tailwind CSS 3", async () => {
  const root = fixture();
  try {
    const tailwind = path.join(repositoryModules, "tailwindcss");
    assert.match(require(path.join(tailwind, "package.json")).version, /^3\./);
    const modules = path.join(root, "node_modules");
    const plugin = path.join(modules, "@rocketicons/tailwind");
    fs.mkdirSync(plugin, { recursive: true });
    fs.symlinkSync(tailwind, path.join(modules, "tailwindcss"), "dir");
    fs.symlinkSync(
      path.join(repositoryModules, "nativewind"),
      path.join(modules, "nativewind"),
      "dir"
    );
    // Copy instead of linking so the plugin resolves this project's Tailwind CSS 3.
    for (const entry of ["package.json", "dist"])
      fs.cpSync(path.resolve(__dirname, "../../tailwind", entry), path.join(plugin, entry), {
        recursive: true
      });
    const config = path.join(root, "tailwind.config.js");
    fs.writeFileSync(
      config,
      fs
        .readFileSync(config, "utf8")
        .replace(/content: \[[^\]]*\]/, "content: [{ raw: 'className=\"icon-sky-500-3xl\"' }]")
    );
    await app.initProject(root);
    const compiled = await postcss([require(tailwind)({ config })]).process(
      "@tailwind components;",
      { from: path.join(root, "global.css") }
    );
    assert.match(compiled.css, /\.icon-sky-500-3xl\s*\{[^}]*fill:\s*#0ea5e9/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("ESM, TypeScript, and variable configs keep their style", async () => {
  const cases = [
    {
      file: "tailwind.config.ts",
      before:
        'import type { Config } from "tailwindcss";\n\nexport default {\n  content: ["./App.tsx"],\n  presets: [require("nativewind/preset")]\n} satisfies Config;\n',
      after:
        'import type { Config } from "tailwindcss";\nimport { nativeIconPlugin } from "@rocketicons/tailwind";\n\nexport default {\n  content: ["./App.tsx"],\n  presets: [require("nativewind/preset")],\n  plugins: [nativeIconPlugin]\n} satisfies Config;\n'
    },
    {
      file: "tailwind.config.js",
      before:
        'const config = {\n  content: ["./App.tsx"],\n  presets: [require("nativewind/preset")],\n  plugins: [\n    require("tailwindcss-animate"),\n  ],\n};\n\nmodule.exports = config;\n',
      after:
        'const config = {\n  content: ["./App.tsx"],\n  presets: [require("nativewind/preset")],\n  plugins: [\n    require("tailwindcss-animate"),\n    require("@rocketicons/tailwind").nativeIconPlugin,\n  ],\n};\n\nmodule.exports = config;\n'
    },
    {
      file: "tailwind.config.mjs",
      before: 'export default { content: ["./App.tsx"], presets: [nativewind], plugins: [] };\n',
      after:
        'import { nativeIconPlugin } from "@rocketicons/tailwind";\nexport default { content: ["./App.tsx"], presets: [nativewind], plugins: [nativeIconPlugin] };\n'
    }
  ];
  for (const { file, before, after } of cases) {
    const root = fixture();
    try {
      fs.rmSync(path.join(root, "tailwind.config.js"));
      fs.writeFileSync(path.join(root, file), before);
      await app.initProject(root);
      assert.equal(fs.readFileSync(path.join(root, file), "utf8"), after, file);
      assert.deepEqual((await app.initProject(root, { dryRun: true })).changes, [], file);
      assert.equal(app.doctor(root).styling.pluginRegistered, true, file);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
});

test("configs that cannot be edited safely ask for a manual registration", async () => {
  for (const source of [
    "module.exports = createConfig();\n",
    'module.exports = { presets: [require("nativewind/preset")], plugins: sharedPlugins };\n'
  ]) {
    const root = fixture();
    try {
      const config = path.join(root, "tailwind.config.js");
      fs.writeFileSync(config, source);
      await assert.rejects(
        app.initProject(root),
        /add require\("@rocketicons\/tailwind"\)\.nativeIconPlugin to its plugins array/
      );
      assert.equal(fs.readFileSync(config, "utf8"), source);
      assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
});

test("a Tailwind CSS 3 project without a Tailwind config cannot be initialized", async () => {
  const root = fixture();
  try {
    fs.rmSync(path.join(root, "tailwind.config.js"));
    await assert.rejects(app.initProject(root, { dryRun: true }), /No Tailwind config found/);
    assert.match(stylingIssues(root).join(" "), /No Tailwind config found/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("doctor explains each missing NativeWind piece", async () => {
  const root = fixture();
  try {
    await app.initProject(root);
    assert.deepEqual(stylingIssues(root), []);
    const babel = path.join(root, "babel.config.js");
    fs.writeFileSync(
      babel,
      'module.exports = { presets: ["babel-preset-expo"], plugins: ["nativewind/babel"] };\n'
    );
    assert.equal(app.doctor(root).styling.babelPreset, false);
    assert.match(stylingIssues(root).join(" "), /nativewind\/babel is a Babel preset/);
    fs.rmSync(babel);
    assert.match(stylingIssues(root).join(" "), /missing the nativewind\/babel preset/);
    fs.writeFileSync(path.join(root, ".babelrc"), '{ "presets": ["nativewind/babel"] }\n');
    fs.writeFileSync(path.join(root, "metro.config.js"), "module.exports = {};\n");
    fs.writeFileSync(
      path.join(root, "App.tsx"),
      "export default function App() { return null; }\n"
    );
    fs.writeFileSync(
      path.join(root, "tailwind.config.js"),
      'module.exports = { content: [], plugins: [require("@rocketicons/tailwind").nativeIconPlugin] };\n'
    );
    const issues = stylingIssues(root).join(" ");
    assert.match(issues, /Metro integration is missing/);
    assert.match(issues, /global.css is not imported/);
    assert.match(issues, /nativewind\/preset/);
    assert.doesNotMatch(issues, /Babel/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("Tailwind CSS 4 needs NativeWind 5, which is left to its own setup", async () => {
  const root = fixture();
  try {
    setDependency(root, "tailwindcss", "^4.2.1");
    const before = fs.readFileSync(path.join(root, "tailwind.config.js"), "utf8");
    await app.initProject(root);
    assert.equal(fs.readFileSync(path.join(root, "tailwind.config.js"), "utf8"), before);
    assert.match(stylingIssues(root).join(" "), /NativeWind 4 requires Tailwind CSS 3/);
    setDependency(root, "nativewind", "5.0.0-rc.0");
    assert.deepEqual(stylingIssues(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("plan includes the Tailwind config edit and rejects changes made after planning", async () => {
  const root = fixture();
  try {
    const config = path.join(root, "tailwind.config.js");
    const plan = await app.planIcons(root, ["@fi/fi-calendar"], { fromFile: "App.tsx" });
    assert.equal(plan.target, "react-native");
    assert.ok(plan.fileChanges.some(({ path }) => path === "tailwind.config.js"));
    assert.equal(fs.readFileSync(config, "utf8"), tailwindConfig(false));
    fs.appendFileSync(config, "// changed\n");
    await assert.rejects(
      app.applyIconPlan(root, ["@fi/fi-calendar"], plan.planId, { fromFile: "App.tsx" }),
      /Plan is stale/
    );
    assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
