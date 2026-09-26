const fs = require("node:fs");
const path = require("node:path");

const source = path.resolve(__dirname, "../../ignition/public/ai/v1");
const output = path.resolve(__dirname, "../data");
if (!fs.existsSync(path.join(source, "catalog.json"))) {
  throw new Error(
    "Static catalog is missing. Run npm run generate-statics --workspace=packages/ignition first."
  );
}
const read = (...parts) => JSON.parse(fs.readFileSync(path.join(source, ...parts), "utf8"));
const catalog = read("catalog.json");
const packageVersion = require("../../icons/package.json").version;
if (catalog.packageVersion !== packageVersion) {
  throw new Error(
    `Static catalog ${catalog.packageVersion} differs from rocketicons ${packageVersion}`
  );
}
const icons = [];

for (const collection of catalog.collections) {
  const index = read("collections", collection.id, "index.json");
  const contextIndex = read("collections", collection.id, "context", "index.json");
  const contexts = new Map();
  const storage = contextIndex.storage;
  const urls =
    storage.mode === "single"
      ? [storage.url]
      : storage.mode === "chunked"
        ? storage.chunks.map((chunk) => chunk.url)
        : [];
  for (const url of urls) {
    const data = read(...url.replace(/^\/ai\/v1\//, "").split("/"));
    for (const context of data.icons) contexts.set(context.id, context);
  }
  for (const icon of index.icons) {
    const context = contexts.get(icon.id);
    icons.push({
      ...icon,
      collection: collection.id,
      description: context?.description,
      aliases: context?.aliases,
      searchTerms: context?.searchTerms,
      negativeTerms: context?.negativeTerms,
      categories: context?.categories,
      uiContexts: context?.uiContexts,
      roles: context?.roles,
      visual: context?.visual
    });
  }
}

fs.mkdirSync(output, { recursive: true });
const shardOutput = path.join(output, "collections");
fs.rmSync(shardOutput, { recursive: true, force: true });
for (const collection of catalog.collections) {
  const sourceDirectory = path.join(source, "collections", collection.id);
  const destinationDirectory = path.join(shardOutput, collection.id);
  fs.mkdirSync(destinationDirectory, { recursive: true });
  for (const name of fs.readdirSync(sourceDirectory).filter((name) => /^\d+\.json$/.test(name))) {
    fs.copyFileSync(path.join(sourceDirectory, name), path.join(destinationDirectory, name));
  }
}
fs.writeFileSync(
  path.join(output, "search.json"),
  JSON.stringify({
    schemaVersion: 1,
    packageVersion: catalog.packageVersion,
    collections: catalog.collections,
    icons
  }) + "\n"
);
console.log(`Indexed ${icons.length} icons across ${catalog.collections.length} collections`);
