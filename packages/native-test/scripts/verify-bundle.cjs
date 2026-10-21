// Run after `npm run export:ios`. Fails when the iOS bundle stops resolving rocketicons for React Native.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const bundleDir = path.resolve(__dirname, "../dist/_expo/static/js/ios");
const maps = fs.readdirSync(bundleDir).filter((file) => file.endsWith(".map"));
assert.equal(maps.length, 1, `expected one source map in ${bundleDir}, found ${maps.length}`);
const { sources, sourcesContent } = JSON.parse(
  fs.readFileSync(path.join(bundleDir, maps[0]), "utf8")
);

// Workspace packages resolve to packages/*, published installs to node_modules/*.
const expectedModules = {
  "rocketicons/my": /\/(packages\/icons|node_modules\/rocketicons)\/my\/index\.m?js$/,
  "rocketicons/core (native)":
    /\/(packages\/icons|node_modules\/rocketicons)\/core\/index\.native\.m?js$/,
  "@rocketicons/utils": /\/(packages\/utils|node_modules\/@rocketicons\/utils)\//
};
for (const [name, pattern] of Object.entries(expectedModules)) {
  assert.ok(
    sources.some((source) => pattern.test(source)),
    `${name} is missing from the bundle`
  );
}

// NativeWind compiles global.css into this module, so the rocketicons plugin rules must be there.
const stylesIndex = sources.findIndex((source) =>
  source.endsWith("react-native-css-interop/.cache/ios.js")
);
assert.ok(stylesIndex >= 0, "NativeWind stylesheet is missing from the bundle");
assert.match(
  sourcesContent[stylesIndex],
  /"icon-sky-500-3xl":/,
  "rocketicons Tailwind plugin emitted no icon rules"
);

console.log(`[native-test] ${maps[0]}: ${sources.length} modules, rocketicons resolved`);
