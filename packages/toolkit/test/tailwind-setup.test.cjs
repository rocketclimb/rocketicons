const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const app = require("../dist");
const postcss = require("postcss");
const tailwindPostcss = require("@tailwindcss/postcss");

const fixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-tailwind-"));
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({
      name: "tailwind-four-web",
      dependencies: {
        tailwindcss: "^4.2.1",
        "@tailwindcss/vite": "^4.2.1",
        "@rocketicons/utils": "1",
        "@rocketicons/tailwind": "1"
      }
    })
  );
  fs.writeFileSync(
    path.join(root, "vite.config.js"),
    'import tailwindcss from "@tailwindcss/vite";\nexport default { plugins: [tailwindcss()] };\n'
  );
  fs.writeFileSync(
    path.join(root, "src/main.tsx"),
    'import "./index.css";\nexport default function App() { return null; }\n'
  );
  fs.writeFileSync(
    path.join(root, "src/index.css"),
    '@import "tailwindcss";\nbody { color: red; }\n'
  );
  fs.writeFileSync(path.join(root, "tsconfig.json"), "{}");
  return root;
};

test("Tailwind 4 setup is planned, applied, diagnosed, and idempotent", async () => {
  const root = fixture();
  try {
    const css = path.join(root, "src/index.css");
    const original = fs.readFileSync(css, "utf8");
    const preview = await app.initProject(root, { dryRun: true });
    assert.ok(
      preview.changes.some(({ path, action }) => path === "src/index.css" && action === "update")
    );
    assert.equal(fs.readFileSync(css, "utf8"), original);
    await app.initProject(root);
    assert.equal(
      fs.readFileSync(css, "utf8"),
      '@import "tailwindcss";\n@plugin "@rocketicons/tailwind";\nbody { color: red; }\n'
    );
    assert.equal(app.inspectProject(root).manifest.stylesheetPath, "src/index.css");
    assert.equal(app.doctor(root).healthy, true);
    assert.deepEqual((await app.initProject(root, { dryRun: true })).changes, []);
    fs.writeFileSync(css, original);
    const diagnosis = app.doctor(root);
    assert.equal(diagnosis.healthy, false);
    assert.match(diagnosis.issues.join(" "), /src\/index.css.*@plugin/);
    fs.writeFileSync(css, '@import "tailwindcss";\n/* @plugin "@rocketicons/tailwind"; */\n');
    assert.equal(app.doctor(root).styling.pluginRegistered, false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the initialized stylesheet compiles an icon class with Tailwind 4", async () => {
  const root = fixture();
  try {
    const modules = path.join(root, "node_modules");
    fs.mkdirSync(path.join(modules, "@rocketicons"), { recursive: true });
    fs.symlinkSync(
      path.resolve(__dirname, "../../tailwind/node_modules/tailwindcss"),
      path.join(modules, "tailwindcss"),
      "dir"
    );
    fs.symlinkSync(
      path.resolve(__dirname, "../../tailwind"),
      path.join(modules, "@rocketicons/tailwind"),
      "dir"
    );
    await app.initProject(root);
    const cssPath = path.join(root, "src/index.css");
    const css = `${fs.readFileSync(cssPath, "utf8")}\n@source inline("icon-default");\n`;
    const compiled = await postcss([tailwindPostcss()]).process(css, { from: cssPath });
    assert.match(compiled.css, /\.icon-default/);
    assert.match(compiled.css, /display:\s*inline-block/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("plugin registration follows a complete Tailwind import with a layer", async () => {
  const root = fixture();
  try {
    const cssPath = path.join(root, "src/index.css");
    fs.writeFileSync(
      cssPath,
      '@import "tailwindcss/theme.css" layer(theme);\n@import "tailwindcss/utilities.css" layer(utilities);\n'
    );
    await app.initProject(root);
    assert.equal(
      fs.readFileSync(cssPath, "utf8"),
      '@import "tailwindcss/theme.css" layer(theme);\n@plugin "@rocketicons/tailwind";\n@import "tailwindcss/utilities.css" layer(utilities);\n'
    );
    assert.equal(app.doctor(root).healthy, true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("doctor accepts PostCSS integration and reports unsupported Tailwind versions", async () => {
  const root = fixture();
  try {
    fs.rmSync(path.join(root, "vite.config.js"));
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    delete pkg.dependencies["@tailwindcss/vite"];
    pkg.dependencies["@tailwindcss/postcss"] = "^4.2.1";
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(pkg));
    fs.writeFileSync(
      path.join(root, "postcss.config.mjs"),
      'export default { plugins: { "@tailwindcss/postcss": {} } };\n'
    );
    await app.initProject(root);
    assert.equal(app.doctor(root).healthy, true);
    assert.equal(app.doctor(root).styling.buildIntegration, "postcss");
    pkg.dependencies.tailwindcss = "^3.4.17";
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(pkg));
    const diagnosis = app.doctor(root);
    assert.equal(diagnosis.healthy, false);
    assert.match(diagnosis.issues.join(" "), /Tailwind CSS 4 is required/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("Tailwind 4 bounded semver ranges receive automatic plugin setup", async () => {
  for (const version of [">=4.0.0 <5", ">=4.1.0 <5.0.0"]) {
    const root = fixture();
    try {
      const packagePath = path.join(root, "package.json");
      const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      pkg.dependencies.tailwindcss = version;
      fs.writeFileSync(packagePath, JSON.stringify(pkg));
      const preview = await app.initProject(root, { dryRun: true });
      assert.ok(
        preview.changes.some(({ path }) => path === "src/index.css"),
        version
      );
      await app.initProject(root);
      assert.match(
        fs.readFileSync(path.join(root, "src/index.css"), "utf8"),
        /@plugin "@rocketicons\/tailwind"/
      );
      const diagnosis = app.doctor(root);
      assert.equal(diagnosis.healthy, true, `${version}: ${diagnosis.issues.join(", ")}`);
      assert.equal(diagnosis.styling.tailwindMajor, 4);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
});

test("plan includes the stylesheet edit and rejects changes made after planning", async () => {
  const root = fixture();
  try {
    const plan = await app.planIcons(root, ["@fi/fi-calendar"], { fromFile: "src/main.tsx" });
    assert.ok(plan.fileChanges.some(({ path }) => path === "src/index.css"));
    assert.equal(
      fs.readFileSync(path.join(root, "src/index.css"), "utf8"),
      '@import "tailwindcss";\nbody { color: red; }\n'
    );
    fs.appendFileSync(path.join(root, "src/index.css"), "/* changed */\n");
    await assert.rejects(
      app.applyIconPlan(root, ["@fi/fi-calendar"], plan.planId, { fromFile: "src/main.tsx" }),
      /Plan is stale/
    );
    assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("doctor explains missing Tailwind integration and unloaded stylesheets", async () => {
  const root = fixture();
  try {
    await app.initProject(root);
    fs.writeFileSync(
      path.join(root, "src/main.tsx"),
      "export default function App() { return null; }\n"
    );
    fs.writeFileSync(path.join(root, "vite.config.js"), "export default { plugins: [] };\n");
    const diagnosis = app.doctor(root);
    assert.equal(diagnosis.healthy, false);
    assert.match(diagnosis.issues.join(" "), /not loaded/);
    assert.match(diagnosis.issues.join(" "), /Tailwind 4 build integration/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("ambiguous stylesheets need an explicit safe path", async () => {
  const root = fixture();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-tailwind-outside-"));
  try {
    fs.writeFileSync(path.join(root, "src/other.css"), '@import "tailwindcss";\n');
    fs.writeFileSync(
      path.join(root, "src/main.tsx"),
      'import "./index.css";\nimport "./other.css";\n'
    );
    await assert.rejects(
      app.initProject(root, { dryRun: true }),
      /Multiple Tailwind stylesheets/
    );
    await assert.rejects(
      app.initProject(root, { dryRun: true, stylesheetPath: "../other.css" }),
      /Path escapes project/
    );
    fs.symlinkSync(path.join(outside, "external.css"), path.join(root, "src/linked.css"));
    await assert.rejects(
      app.initProject(root, { dryRun: true, stylesheetPath: "src/linked.css" }),
      /Symlink is not allowed/
    );
    await app.initProject(root, { stylesheetPath: "src/index.css" });
    assert.equal(app.doctor(root).healthy, true);
    assert.doesNotMatch(fs.readFileSync(path.join(root, "src/other.css"), "utf8"), /@plugin/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});
