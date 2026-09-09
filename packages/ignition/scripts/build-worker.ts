/**
 * Bundles the Pages Worker into the static export.
 *
 * Cloudflare Pages picks up `_worker.js` from the deployed directory, and `_routes.json`
 * decides which requests reach it. Scoping it to the collection pages means static assets are
 * served directly and never spend a Worker invocation, which is what keeps this inside the
 * free plan's 100k requests/day.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

import { siteConfig } from "../src/config/site";
import { AvailableLanguages } from "../src/app/types/languages";

const OUT_DIR = resolve("./out");
const ENTRY = resolve("./src/worker/index.ts");

const routes = {
  version: 1,
  include: AvailableLanguages.map((lang) => `/${lang}/icons/*`),
  exclude: []
};

const main = async () => {
  if (!existsSync(OUT_DIR)) {
    console.log("[IGNITION] no export found, skipping worker build");
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });
  await build({
    entryPoints: [ENTRY],
    outfile: resolve(OUT_DIR, "_worker.js"),
    bundle: true,
    format: "esm",
    target: "es2022",
    platform: "neutral",
    minify: true,
    // The worker cannot import site config directly: it reads process.env, which Workers lack.
    define: { SITE_NAME: JSON.stringify(siteConfig.name) }
  });

  await writeFile(
    resolve(OUT_DIR, "_routes.json"),
    `${JSON.stringify(routes, null, 2)}\n`,
    "utf8"
  );
  console.log(`[IGNITION] worker bundled; routes: ${routes.include.join(", ")}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
