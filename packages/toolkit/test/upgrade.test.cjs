const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHash } = require("node:crypto");
const app = require("../dist");
const { normalizedComponentHash } = require("../dist/component-hash");
const sha = (value) => createHash("sha256").update(value).digest("hex");
const save = (root, manifest) =>
  fs.writeFileSync(path.join(root, "rocketicons.json"), JSON.stringify(manifest, null, 2));
const read = (root) => JSON.parse(fs.readFileSync(path.join(root, "rocketicons.json")));
const snapshot = (root) =>
  Object.fromEntries(
    fs
      .readdirSync(root, { recursive: true })
      .filter((p) => fs.statSync(path.join(root, p)).isFile())
      .map((p) => [p, fs.readFileSync(path.join(root, p), "utf8")])
  );
async function fixture(t, language = "ts", target = "react") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-upgrade-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({
      name: "upgrade-fixture",
      dependencies: {
        "@rocketicons/utils": "1",
        "@rocketicons/tailwind": "1",
        ...(target === "react" ? { tailwindcss: "^4.2.1", "@tailwindcss/vite": "^4.2.1" } : {}),
        ...(target === "react-native" ? { nativewind: "1", "react-native-svg": "1" } : {})
      }
    })
  );
  fs.writeFileSync(path.join(root, "App.jsx"), "export default function App() { return null; }");
  if (language === "ts") fs.writeFileSync(path.join(root, "tsconfig.json"), "{}");
  if (target === "react") {
    fs.mkdirSync(path.join(root, "src"));
    fs.writeFileSync(path.join(root, "src/index.css"), '@import "tailwindcss";\n');
    fs.writeFileSync(path.join(root, "src/main.jsx"), 'import "./index.css";\n');
    fs.writeFileSync(
      path.join(root, "vite.config.js"),
      'import tailwindcss from "@tailwindcss/vite"; export default { plugins: [tailwindcss()] };'
    );
  }
  await app.initProject(root, { language, target });
  await app.addIcons(root, ["@fi/fi-calendar", "@fi/fi-camera"]);
  const manifest = read(root);
  manifest.catalogVersion = "0.3.3";
  for (const record of Object.values(manifest.icons)) {
    delete record.catalogVersion;
    const file = path.join(root, record.path);
    const old = fs
      .readFileSync(file, "utf8")
      .replace(`catalog: ${app.catalogVersion}`, "catalog: 0.3.3");
    fs.writeFileSync(file, old);
    record.sha256 = normalizedComponentHash(old);
  }
  save(root, manifest);
  return root;
}
for (const language of ["ts", "js"])
  for (const target of ["react", "react-native"])
    test(`${language} ${target}: explicit catalog upgrade preserves files and enables adding`, async (t) => {
      const root = await fixture(t, language, target);
      const before = snapshot(root);
      await assert.rejects(
        app.addIcons(root, ["@fi/fi-search"], true),
        /catalog version differs/
      );
      const plan = app.planProjectUpgrade(root);
      assert.equal(plan.fromCatalogVersion, "0.3.3");
      assert.equal(plan.toCatalogVersion, app.catalogVersion);
      assert.deepEqual(
        plan.fileChanges.map((c) => c.path),
        ["rocketicons.json"]
      );
      assert.equal(plan.preservedIcons.length, 2);
      assert.ok(plan.issues.some((issue) => issue.includes("differs")));
      await app.applyProjectUpgrade(root, plan.planId, true);
      assert.deepEqual(snapshot(root), before);
      const result = await app.applyProjectUpgrade(root, plan.planId);
      assert.equal(result.verification.healthy, true);
      const after = snapshot(root);
      for (const file of Object.keys(before).filter((file) => file !== "rocketicons.json"))
        assert.equal(after[file], before[file]);
      for (const record of Object.values(read(root).icons))
        assert.equal(record.catalogVersion, "0.3.3");
      const icons = await app.planIcons(root, ["@fi/fi-search", "@fi/fi-calendar"], {
        fromFile: "App.jsx"
      });
      const applied = await app.applyIconPlan(root, icons.iconIds, icons.planId, {
        fromFile: "App.jsx"
      });
      assert.equal(applied.verification.healthy, true);
      assert.equal(read(root).icons["@fi/fi-search"].catalogVersion, app.catalogVersion);
      assert.equal(
        fs.readFileSync(path.join(root, read(root).icons["@fi/fi-calendar"].path), "utf8"),
        before[read(root).icons["@fi/fi-calendar"].path]
      );
      const noOp = app.planProjectUpgrade(root);
      assert.deepEqual(noOp.fileChanges, []);
      const current = snapshot(root);
      await app.applyProjectUpgrade(root, noOp.planId);
      assert.deepEqual(snapshot(root), current);
    });

test("legacy hashes, formatting and customizations retain protection and provenance", async (t) => {
  const root = await fixture(t);
  const manifest = read(root);
  const calendar = manifest.icons["@fi/fi-calendar"];
  delete calendar.hashAlgorithm;
  calendar.sha256 = sha(fs.readFileSync(path.join(root, calendar.path)));
  fs.appendFileSync(path.join(root, calendar.path), "\n"); // Cannot prove legacy formatting against another catalog.
  const camera = manifest.icons["@fi/fi-camera"];
  fs.appendFileSync(path.join(root, camera.path), "\n// custom\n");
  save(root, manifest);
  const before = snapshot(root);
  const plan = app.planProjectUpgrade(root);
  assert.ok(plan.preservedIcons.every((icon) => icon.status === "customized"));
  await app.applyProjectUpgrade(root, plan.planId);
  assert.deepEqual(app.doctor(root).customizedIcons.sort(), ["@fi/fi-calendar", "@fi/fi-camera"]);
  await assert.rejects(app.removeIcons(root, ["@fi/fi-calendar"]), /customized/);
  for (const record of Object.values(manifest.icons))
    assert.equal(fs.readFileSync(path.join(root, record.path), "utf8"), before[record.path]);
  assert.equal(read(root).icons["@fi/fi-calendar"].sha256, calendar.sha256);
});

test("raw file edits and manifest edits invalidate upgrade plans", async (t) => {
  const root = await fixture(t);
  let plan = app.planProjectUpgrade(root);
  const record = read(root).icons["@fi/fi-calendar"];
  fs.appendFileSync(path.join(root, record.path), "\n");
  const before = snapshot(root);
  await assert.rejects(app.applyProjectUpgrade(root, plan.planId), /Upgrade plan is stale/);
  assert.deepEqual(snapshot(root), before);
  plan = app.planProjectUpgrade(root);
  fs.appendFileSync(path.join(root, "rocketicons.json"), "\n");
  await assert.rejects(app.applyProjectUpgrade(root, plan.planId, true), /Upgrade plan is stale/);
});

test("missing and unavailable icons are preserved, diagnosed and reusable at recorded paths", async (t) => {
  const root = await fixture(t);
  const manifest = read(root);
  const record = manifest.icons["@fi/fi-calendar"];
  const oldPath = record.path;
  record.path = "src/ri/icons/fi-fi-calendar.tsx";
  fs.renameSync(path.join(root, oldPath), path.join(root, record.path));
  const retired = {
    ...manifest.icons["@fi/fi-camera"],
    collection: "retired",
    path: "src/ri/icons/retired-icon.tsx",
    component: "RetiredIcon"
  };
  manifest.icons["@retired/retired-icon"] = retired;
  fs.writeFileSync(
    path.join(root, retired.path),
    "export default function RetiredIcon() { return null; }"
  );
  retired.sha256 = normalizedComponentHash(
    fs.readFileSync(path.join(root, retired.path), "utf8")
  );
  fs.unlinkSync(path.join(root, manifest.icons["@fi/fi-camera"].path));
  save(root, manifest);
  const plan = app.planProjectUpgrade(root);
  assert.equal(plan.warnings.length, 1);
  await app.applyProjectUpgrade(root, plan.planId);
  assert.match(app.doctor(root).issues.join("\n"), /Missing generated file/);
  const usage = app.iconUsage("@retired/retired-icon", "react", "ts", {
    projectPath: root,
    fromFile: "App.jsx"
  });
  assert.equal(usage.catalogAvailable, false);
  assert.match(usage.importStatement, /retired-icon/);
  const added = await app.planIcons(
    root,
    ["@fi/fi-calendar", "@fi/fi-camera", "@retired/retired-icon"],
    { fromFile: "App.jsx" }
  );
  assert.match(added.imports[0].importStatement, /fi-fi-calendar/);
  await app.applyIconPlan(root, added.iconIds, added.planId, { fromFile: "App.jsx" });
  assert.equal(read(root).icons["@fi/fi-camera"].catalogVersion, app.catalogVersion);
  const recommendations = await app.recommendIcons(
    { projectPath: root, intent: "calendar" },
    async () => ({ source: "local", catalogVersion: app.catalogVersion, results: [] })
  );
  assert.ok(recommendations.results.some((icon) => icon.id === "@fi/fi-calendar"));
  fs.unlinkSync(path.join(root, retired.path));
  await assert.rejects(
    app.addIcons(root, ["@retired/retired-icon"]),
    /Cannot repair unavailable icon/
  );
  await app.removeIcons(root, ["@retired/retired-icon"]);
  assert.equal(read(root).icons["@retired/retired-icon"], undefined);
});

test("invalid versions, downgrades, unsafe paths, duplicates and symlinks are rejected without writes", async (t) => {
  const root = await fixture(t);
  const original = read(root);
  for (const version of ["garbage", "01.2.3", "1.0.0-01", "999.0.0"]) {
    save(root, { ...original, catalogVersion: version });
    const before = snapshot(root);
    assert.throws(() => app.planProjectUpgrade(root), /Invalid catalog version|downgrade/);
    assert.deepEqual(snapshot(root), before);
  }
  for (const unsafe of [
    "../outside.tsx",
    "src/ri/core/index.tsx",
    "src/ri/icons/../core/index.tsx"
  ]) {
    const bad = structuredClone(original);
    bad.icons["@fi/fi-calendar"].path = unsafe;
    save(root, bad);
    assert.throws(() => app.planProjectUpgrade(root), /Invalid manifest/);
  }
  const duplicate = structuredClone(original);
  duplicate.icons["@other/fi-calendar"] = {
    ...duplicate.icons["@fi/fi-calendar"],
    collection: "other"
  };
  save(root, duplicate);
  assert.throws(() => app.planProjectUpgrade(root), /Invalid manifest/);
  save(root, original);
  const file = path.join(root, original.icons["@fi/fi-calendar"].path);
  fs.unlinkSync(file);
  fs.symlinkSync(path.join(root, "App.jsx"), file);
  assert.throws(() => app.planProjectUpgrade(root), /Symlink/);
});

test("new destination collisions fail before writes; empty manifests upgrade without setup changes", async (t) => {
  const root = await fixture(t);
  const manifest = read(root);
  manifest.icons = {
    "@old/fi-search": {
      ...manifest.icons["@fi/fi-calendar"],
      collection: "old",
      path: "src/ri/icons/fi-search.tsx"
    }
  };
  save(root, manifest);
  await app.applyProjectUpgrade(root, app.planProjectUpgrade(root).planId);
  const before = snapshot(root);
  await assert.rejects(app.addIcons(root, ["@fi/fi-search"]), /conflicts/);
  await assert.rejects(
    app.planIcons(root, ["@fi/fi-search"], { fromFile: "App.jsx" }),
    /conflicts/
  );
  assert.deepEqual(snapshot(root), before);
  manifest.icons = {};
  save(root, manifest);
  await app.applyProjectUpgrade(root, app.planProjectUpgrade(root).planId);
  assert.deepEqual(read(root).icons, {});
});

test("normalized formatting and unchanged legacy byte hashes remain current after upgrade", async (t) => {
  const root = await fixture(t);
  const manifest = read(root);
  const calendar = manifest.icons["@fi/fi-calendar"];
  delete calendar.hashAlgorithm;
  calendar.sha256 = sha(fs.readFileSync(path.join(root, calendar.path)));
  const camera = manifest.icons["@fi/fi-camera"];
  fs.appendFileSync(path.join(root, camera.path), "\n\n");
  save(root, manifest);
  const before = snapshot(root);
  await app.applyProjectUpgrade(root, app.planProjectUpgrade(root).planId);
  assert.deepEqual(app.inspectProject(root).installedIconStatus, {
    "@fi/fi-calendar": "current",
    "@fi/fi-camera": "current"
  });
  for (const record of Object.values(manifest.icons))
    assert.equal(fs.readFileSync(path.join(root, record.path), "utf8"), before[record.path]);
});

test("upgrade preserves unrelated diagnostics and orders prerelease versions numerically", async (t) => {
  const root = await fixture(t);
  const manifest = read(root);
  fs.writeFileSync(path.join(root, "src/main.jsx"), "// CSS not imported");
  const plan = app.planProjectUpgrade(root);
  assert.ok(plan.issues.some((issue) => issue.includes("not loaded")));
  const result = await app.applyProjectUpgrade(root, plan.planId);
  assert.equal(result.verification.healthy, false);
  assert.ok(result.verification.issues.some((issue) => issue.includes("not loaded")));
  for (const version of [
    `${app.catalogVersion}-rc.2`,
    `${app.catalogVersion}-rc.10`,
    `${app.catalogVersion}+old-build`
  ]) {
    save(root, { ...manifest, catalogVersion: version });
    assert.equal(app.planProjectUpgrade(root).fromCatalogVersion, version);
  }
  save(root, { ...manifest, catalogVersion: "999.0.0-alpha.1" });
  assert.throws(() => app.planProjectUpgrade(root), /downgrade/);
});
