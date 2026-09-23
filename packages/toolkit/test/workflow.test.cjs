const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const app = require("../dist");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const fixture = (language, target) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-test-"));
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({
      name: "fixture",
      version: "1.0.0",
      dependencies: {
        "@rocketicons/utils": "1",
        "@rocketicons/tailwind": "1",
        ...(target === "react-native" ? { nativewind: "1", "react-native-svg": "1" } : {})
      }
    })
  );
  if (language === "ts")
    fs.writeFileSync(
      path.join(root, "tsconfig.json"),
      '{ // preserve me\n "compilerOptions": {"jsx":"react-jsx"}\n}'
    );
  return root;
};

test("collection-qualified exact IDs and remote fallback", async () => {
  assert.equal(app.requireIcon("@hi/hi-shopping-cart").collection, "hi");
  assert.equal(app.requireIcon("@hi2/hi-shopping-cart").collection, "hi2");
  assert.throws(() => app.requireIcon("hi-shopping-cart"), /Ambiguous icon/);
  const input = { query: "calendar", collections: ["fi"], variants: ["outlined"], limit: 5 };
  assert.equal(
    app.buildAlgoliaFilters(input),
    "recordType:icon AND (group:fi) AND (variant:outlined)"
  );
  const online = await app.searchIcons(input, async (received) => {
    assert.deepEqual(received, input);
    return [{ iconId: "fi-calendar", group: "fi" }];
  });
  assert.equal(online.source, "algolia");
  assert.equal(online.results[0].id, "@fi/fi-calendar");
  const unavailableIcon = await app.searchIcons(input, async () => [
    { iconId: "fi-not-in-catalog", group: "fi" }
  ]);
  assert.equal(unavailableIcon.source, "local");
  const staleEmpty = await app.searchIcons(input, async () => []);
  assert.equal(staleEmpty.source, "local");
  const offline = await app.searchIcons(input, async () => {
    throw new Error("offline");
  });
  assert.equal(offline.source, "local");
  assert.equal(offline.results[0].id, "@fi/fi-calendar");
  const exact = await app.searchIcons({ query: "@fi/fi-calendar" }, async () => {
    throw new Error("must not contact Algolia");
  });
  assert.equal(exact.results[0].id, "@fi/fi-calendar");
});

test("reviewed local search corpus reaches 90% top-5 relevance", () => {
  const cases = [
    ["calendar", "fi-calendar"],
    ["shopping cart", "fi-shopping-cart"],
    ["settings", "fi-settings"],
    ["close", "fi-x"],
    ["search", "fi-search"],
    ["user profile", "fi-user"],
    ["mail", "fi-mail"],
    ["download", "fi-download"],
    ["home", "fi-home"],
    ["trash", "fi-trash"],
    ["calendário", "fi-calendar"],
    ["carrinho de compras", "fi-shopping-cart"],
    ["lixeira", "fi-trash"],
    ["pesquisa", "fi-search"],
    ["usuário", "fi-user"]
  ];
  const relevant = cases.filter(([query, id]) =>
    app
      .localSearch({ query, collections: ["fi"], limit: 5 })
      .results.some((result) => result.id === `@fi/${id}`)
  ).length;
  assert.ok(relevant / cases.length >= 0.9, `${relevant}/${cases.length} relevant in top 5`);
});

for (const language of ["ts", "js"])
  for (const target of ["react", "react-native"]) {
    test(`${language} ${target}: setup, add, diagnose, remove`, async () => {
      const root = fixture(language, target);
      try {
        const preview = await app.initProject(root, { language, target, dryRun: true });
        assert.ok(preview.changes.length >= 4);
        assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
        await app.initProject(root, { language, target });
        assert.deepEqual(
          (await app.initProject(root, { language, target, dryRun: true })).changes,
          []
        );
        const config = fs.readFileSync(
          path.join(root, language === "ts" ? "tsconfig.json" : "jsconfig.json"),
          "utf8"
        );
        if (language === "ts") assert.match(config, /preserve me/);
        const ids = ["@fi/fi-calendar", "@hi/hi-shopping-cart", "@hi2/hi-shopping-cart"];
        assert.equal((await app.addIcons(root, ids, true)).changes.length, 4);
        assert.equal(
          fs.existsSync(
            path.join(root, `src/ri/icons/fi-calendar.${language === "ts" ? "tsx" : "jsx"}`)
          ),
          false
        );
        await app.addIcons(root, ids);
        assert.equal(app.doctor(root).healthy, true);
        const generatedPath = path.join(
          root,
          app.iconUsage(ids[0], target, language).generatedPath
        );
        const compiled = ts.transpileModule(fs.readFileSync(generatedPath, "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.ReactJSX,
            target: ts.ScriptTarget.ES2022
          },
          reportDiagnostics: true
        });
        assert.equal(
          compiled.diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error)
            .length,
          0
        );
        const generatedModule = { exports: {} };
        const load = (name) => (name === "../core" ? require("../../core/dist") : require(name));
        new Function("require", "module", "exports", compiled.outputText)(
          load,
          generatedModule,
          generatedModule.exports
        );
        assert.match(
          renderToStaticMarkup(
            React.createElement(generatedModule.exports.default, { className: "icon-primary-xl" })
          ),
          /<svg/
        );
        assert.notEqual(
          app.iconUsage(ids[1], target, language).generatedPath,
          app.iconUsage(ids[2], target, language).generatedPath
        );
        assert.deepEqual((await app.addIcons(root, ids, true)).changes, []);
        const file = path.join(root, app.iconUsage(ids[0], target, language).generatedPath);
        fs.appendFileSync(file, "// user edit\n");
        assert.equal(app.doctor(root).healthy, false);
        await assert.rejects(app.removeIcons(root, [ids[0]]), /edited file/);
        await assert.rejects(app.addIcons(root, [ids[0]]), /edited file/);
        await app.removeIcons(root, [ids[1], ids[2]]);
        assert.equal(Object.keys(app.inspectProject(root).manifest.icons).length, 1);
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    });
  }

test("managed path symlinks cannot escape the project", async () => {
  const root = fixture("ts", "react");
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-outside-"));
  try {
    fs.mkdirSync(path.join(root, "src", "ri"), { recursive: true });
    fs.symlinkSync(outside, path.join(root, "src", "ri", "icons"));
    await app.initProject(root, { language: "ts", target: "react" });
    await assert.rejects(app.addIcons(root, ["@fi/fi-calendar"]), /Symlink is not allowed/);
    assert.deepEqual(fs.readdirSync(outside), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});
