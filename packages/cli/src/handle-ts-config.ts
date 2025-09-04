import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { config } from "./config";

const handleTsConfig = async () => {
  console.log("Verifying tsconfig.json...");
  const alias = `${config.pathAlias}/*`;
  const path = `${config.riPath}/*`;
  try {
    const tsconfig = join(process.cwd(), "tsconfig.json");
    const tsconfigContent = JSON.parse(readFileSync(tsconfig, "utf8"));
    delete tsconfigContent.compilerOptions.paths[alias];

    const entries = Object.entries(tsconfigContent.compilerOptions.paths);
    tsconfigContent.compilerOptions.paths = {};

    tsconfigContent.compilerOptions.paths[alias] = [path];

    entries.forEach(([key, value]) => (tsconfigContent.compilerOptions.paths[key] = value));

    await writeFileSync(tsconfig, JSON.stringify(tsconfigContent, null, 2));

    console.log("Found and updated tsconfig.json");
  } catch (error) {
    console.error("Failed to read tsconfig.json, is it really a TS project?");
    process.exit(1);
  }
};

export default handleTsConfig;
