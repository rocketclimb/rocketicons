import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const quoted = rawValue.match(/^(["'])(.*)\1$/);
    const value = quoted ? quoted[2] : rawValue.replace(/\s+#.*$/, "").trim();
    process.env[key] ??= value;
  }
}
