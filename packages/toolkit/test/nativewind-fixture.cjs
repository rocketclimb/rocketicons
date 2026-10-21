// Writes the NativeWind 4 (Tailwind CSS 3) setup that React Native styling checks expect.
const fs = require("node:fs");
const path = require("node:path");

const nativewindDependencies = {
  "react-native": "1",
  nativewind: "^4.2.7",
  "react-native-svg": "1",
  tailwindcss: "^3.4.17"
};

const tailwindConfig = (plugin) =>
  `module.exports = {\n  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],\n  presets: [require("nativewind/preset")]${plugin ? ',\n  plugins: [require("@rocketicons/tailwind").nativeIconPlugin]' : ""}\n};\n`;

const writeNativeWindSetup = (root, { entry = "App.tsx", plugin = false } = {}) => {
  fs.writeFileSync(path.join(root, "tailwind.config.js"), tailwindConfig(plugin));
  fs.writeFileSync(
    path.join(root, "global.css"),
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
  );
  const entryPath = path.join(root, entry);
  const css = path.relative(path.dirname(entryPath), path.join(root, "global.css"));
  fs.mkdirSync(path.dirname(entryPath), { recursive: true });
  fs.writeFileSync(
    entryPath,
    `import "${css.startsWith(".") ? css : `./${css}`}";\n${fs.existsSync(entryPath) ? fs.readFileSync(entryPath, "utf8") : ""}`
  );
  fs.writeFileSync(
    path.join(root, "metro.config.js"),
    'const { getDefaultConfig } = require("expo/metro-config");\nconst { withNativeWind } = require("nativewind/metro");\n\nmodule.exports = withNativeWind(getDefaultConfig(__dirname), { input: "./global.css" });\n'
  );
  fs.writeFileSync(
    path.join(root, "babel.config.js"),
    'module.exports = function (api) {\n  api.cache(true);\n  return {\n    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"]\n  };\n};\n'
  );
};

module.exports = { nativewindDependencies, tailwindConfig, writeNativeWindSetup };
