const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const app = require("../dist");

const fixture = (target = "react", language = "ts") => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-recommend-"));
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({
      name: "recommend-fixture",
      version: "1",
      dependencies: {
        "@rocketicons/utils": "1",
        "@rocketicons/tailwind": "1",
        ...(target === "react-native"
          ? { "react-native": "1", nativewind: "1", "react-native-svg": "1" }
          : {})
      }
    })
  );
  if (language === "ts") fs.writeFileSync(path.join(root, "tsconfig.json"), "{}");
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(
    path.join(root, `src/App.${language === "ts" ? "tsx" : "jsx"}`),
    "export default function App() { return null; }\n"
  );
  return root;
};

const local = async (input) => app.localSearch(input);

test("recommends a relevant installed icon before catalog candidates in its collection", async () => {
  const root = fixture();
  try {
    await app.initProject(root, { target: "react", language: "ts" });
    await app.addIcons(root, ["@fi/fi-calendar"]);
    const manifestPath = path.join(root, "rocketicons.json");
    const before = fs.readFileSync(manifestPath, "utf8");
    const calls = [];
    const response = await app.recommendIcons(
      { projectPath: root, intent: "calendar", limit: 3, fromFile: "src/App.tsx" },
      async (input) => {
        calls.push(input);
        return local(input);
      }
    );
    assert.deepEqual(calls[0].collections, ["fi"]);
    assert.equal(response.initialized, true);
    assert.equal(response.installedIconCount, 1);
    assert.deepEqual(response.installedCollections, [{ id: "fi", name: "Feather", count: 1 }]);
    assert.equal(response.results[0].id, "@fi/fi-calendar");
    assert.equal(response.results[0].action, "reuse");
    assert.match(
      response.results[0].recommendationReason,
      /Already installed at src\/ri\/icons\/fi-calendar.tsx/
    );
    assert.equal(response.results[0].usage.web.generatedPath, "src/ri/icons/fi-calendar.tsx");
    assert.match(response.results[0].usage.web.importStatement, /FiCalendar/);
    assert.match(response.results[0].usage.web.importStatement, /\.\/ri\/icons\/fi-calendar/);
    assert.match(response.results[0].usage.reactNative.example, /FiCalendar/);
    assert.ok(response.results.every(({ collection }) => collection === "fi"));
    assert.equal(fs.readFileSync(manifestPath, "utf8"), before);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("searches beyond installed collections only when that collection has no match", async () => {
  const root = fixture();
  try {
    await app.initProject(root);
    await app.addIcons(root, ["@fi/fi-calendar"]);
    const calls = [];
    const response = await app.recommendIcons(
      { projectPath: root, intent: "rocket", limit: 2 },
      async (input) => {
        calls.push(input);
        return local(input);
      }
    );
    assert.deepEqual(
      calls.map(({ collections }) => collections ?? []),
      [["fi"], []]
    );
    assert.equal(response.usedGlobalFallback, true);
    assert.deepEqual(response.searchedCollections, []);
    assert.equal(response.results[0].action, "add");
    assert.notEqual(response.results[0].collection, "fi");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("does not recommend reusing an edited managed icon", async () => {
  const root = fixture();
  try {
    await app.initProject(root);
    await app.addIcons(root, ["@fi/fi-calendar"]);
    fs.appendFileSync(path.join(root, "src/ri/icons/fi-calendar.tsx"), "// edited\n");
    const response = await app.recommendIcons(
      { projectPath: root, intent: "@fi/fi-calendar" },
      (input) =>
        app.searchIcons(input, async () => {
          throw new Error("offline");
        })
    );
    assert.equal(response.installedIconCount, 0);
    assert.equal(response.managedIconCount, 1);
    assert.equal(response.results[0].action, "repair");
    assert.equal(response.results[0].installed, false);
    assert.equal(response.results[0].installedStatus, "modified");
    assert.match(response.results[0].recommendationReason, /run doctor/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("marks a missing managed icon for repair instead of reuse", async () => {
  const root = fixture();
  try {
    await app.initProject(root);
    await app.addIcons(root, ["@fi/fi-calendar"]);
    fs.rmSync(path.join(root, "src/ri/icons/fi-calendar.tsx"));
    const response = await app.recommendIcons(
      { projectPath: root, intent: "@fi/fi-calendar" },
      (input) =>
        app.searchIcons(input, async () => {
          throw new Error("offline");
        })
    );
    assert.equal(response.installedIconCount, 0);
    assert.equal(response.results[0].action, "repair");
    assert.equal(response.results[0].installedStatus, "missing");
    assert.equal(app.doctor(root).healthy, false);
    assert.match(app.doctor(root).issues.join(" "), /Missing generated file/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("detects a JavaScript React Native project before initialization", async () => {
  const root = fixture("react-native", "js");
  try {
    const response = await app.recommendIcons(
      { projectPath: root, intent: "camera", limit: 2 },
      local
    );
    assert.equal(response.initialized, false);
    assert.equal(response.target, "react-native");
    assert.equal(response.language, "js");
    assert.deepEqual(response.installedCollections, []);
    assert.equal(response.results.length, 2);
    assert.equal(response.results[0].action, "add");
    assert.match(response.results[0].usage.web.generatedPath, /\.jsx$/);
    assert.match(response.results[0].usage.reactNative.generatedPath, /\.jsx$/);
    assert.equal(fs.existsSync(path.join(root, "rocketicons.json")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
