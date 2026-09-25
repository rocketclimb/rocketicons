const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const source = path.resolve(__dirname, "../../core/src");
const output = path.resolve(__dirname, "../templates");
fs.mkdirSync(output, { recursive: true });
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
