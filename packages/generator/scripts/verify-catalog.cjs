// Run after generating the package and the complete web catalog.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const packageRoot = path.resolve(__dirname, "../../icons");
const catalogRoot = path.resolve(__dirname, "../../ignition/public/ai/v1");
const { IconsManifest } = require(path.join(packageRoot, "data/icons-manifest"));
const catalog = JSON.parse(fs.readFileSync(path.join(catalogRoot, "catalog.json"), "utf8"));
assert.equal(catalog.collections.length, IconsManifest.length);
let exportsChecked = 0;
let recordsChecked = 0;

for (const collection of IconsManifest) {
  assert.ok(collection.totalIcons > 0, `${collection.id}: empty pack`);
  const components = require(path.join(packageRoot, collection.id));
  const { manifest } = require(path.join(packageRoot, collection.id, "manifest"));
  for (const component of collection.icons) {
    assert.equal(typeof components[component], "function", `${collection.id}/${component}`);
    const svg = renderToStaticMarkup(React.createElement(components[component]));
    assert.match(svg, /^<svg\b/, `${component}: invalid rendered SVG`);
    // Codicons deliberately includes a blank placeholder icon.
    if (component !== "VscBlank") {
      assert.match(
        svg,
        /<(path|circle|ellipse|rect|polygon|polyline|line|g)\b/,
        `${component}: empty SVG`
      );
    }
    exportsChecked++;
  }
  const directory = path.join(catalogRoot, "collections", collection.id);
  const index = JSON.parse(fs.readFileSync(path.join(directory, "index.json"), "utf8"));
  // Upstream aliases can share an icon ID (for example Lucide's AZ/Az exports).
  assert.equal(
    index.icons.length,
    new Set(Object.values(manifest.icons).map((icon) => icon.id)).size
  );
  assert.equal(index.collection.totalIcons, index.icons.length);
  const shards = new Map();
  for (const icon of index.icons) {
    if (!shards.has(icon.chunk)) {
      shards.set(
        icon.chunk,
        JSON.parse(fs.readFileSync(path.join(directory, `${icon.chunk}.json`), "utf8"))
      );
    }
    const record = shards.get(icon.chunk).icons.find((item) => item.id === icon.id);
    assert.ok(record, `${collection.id}/${icon.id}: missing shard record`);
    assert.equal(record.component, icon.component);
    assert.equal(record.iconTree.tag, "svg");
    assert.ok(record.component === "VscBlank" || record.iconTree.child.length > 0);
    assert.equal(typeof components[record.component], "function");
    recordsChecked++;
  }
  console.log(
    `PASS ${collection.id}: ${collection.totalIcons} exports, ${index.icons.length} web icons`
  );
}
console.log(
  `PASS ${IconsManifest.length} packs, ${exportsChecked} rendered exports, ${recordsChecked} web records`
);
