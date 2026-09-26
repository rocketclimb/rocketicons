const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const source = path.resolve(__dirname, "../../core/src");
const output = path.resolve(__dirname, "../templates");
fs.mkdirSync(output, { recursive: true });
// Init installs the runtimes used by these generated core templates. Capture
// their versions after release bumps: a fixed ^0.7.0 excludes a 0.8.0 release.
const runtimeDependencies = Object.fromEntries(
  ["utils", "tailwind"].map((workspace) => {
    const pkg = require(`../../${workspace}/package.json`);
    return [pkg.name, `^${pkg.version}`];
  })
);
fs.mkdirSync(path.resolve(__dirname, "../data"), { recursive: true });
fs.writeFileSync(
  path.resolve(__dirname, "../data/runtime-dependencies.json"),
  JSON.stringify(runtimeDependencies, null, 2) + "\n"
);
for (const name of ["index", "index.native"]) {
  const tsx = fs.readFileSync(path.join(source, `${name}.tsx`), "utf8");
  const js = ts.transpileModule(tsx, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve
    }
  }).outputText;
  fs.writeFileSync(path.join(output, `${name}.tsx`), tsx);
  fs.writeFileSync(path.join(output, `${name}.jsx`), js);
}
