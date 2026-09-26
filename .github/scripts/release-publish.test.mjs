import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  packageNames,
  publicationAuth,
  publicationState,
  publishPrepared,
  readArchives,
  registryVersion
} from "./release-publish.mjs";

const repository = { type: "git", url: "git+https://github.com/rocketclimb/rocketicons.git" };
const entries = packageNames.map((name) => ({
  manifest: { name, version: "1.0.0", repository },
  archive: `${name}.tgz`,
  integrity: `sha512-${name}`
}));
const published = (entry) => ({ ...entry.manifest, dist: { integrity: entry.integrity } });

test("all five packages can resume only when published archive integrity matches", () => {
  for (const entry of entries) {
    assert.equal(publicationState(entry, null), "publish");
    assert.equal(publicationState(entry, published(entry)), "skip");
    assert.throws(
      () => publicationState(entry, { ...published(entry), dist: { integrity: "sha512-other" } }),
      /different files/
    );
    assert.throws(
      () => publicationState(entry, { ...published(entry), version: "2.0.0" }),
      /different files/
    );
  }
});

test("only npm's explicit E404 means the version is absent", () => {
  assert.equal(
    registryVersion("package@1", () => ({ status: 1, stdout: '{"error":{"code":"E404"}}' })),
    null
  );
  for (const code of ["E403", "E401", "E500", "ETIMEDOUT"])
    assert.throws(
      () =>
        registryVersion("package@1", () => ({
          status: 1,
          stdout: JSON.stringify({ error: { code } })
        })),
      /Could not inspect/
    );
  assert.throws(
    () => registryVersion("package@1", () => ({ status: 1, stdout: "invalid json" })),
    /Could not inspect/
  );
});

test("a partial retry skips matching packages and publishes remaining dependencies in order", () => {
  const registry = new Map([[entries[0].manifest.name, published(entries[0])]]);
  const writes = [];
  publishPrepared(entries, {
    lookup: (spec) => registry.get(spec.slice(0, spec.lastIndexOf("@"))) ?? null,
    publish: (archive) => {
      const entry = entries.find((item) => item.archive === archive);
      writes.push(entry.manifest.name);
      registry.set(entry.manifest.name, published(entry));
    }
  });
  assert.deepEqual(writes, packageNames.slice(1));
});

test("a later package mismatch prevents every publication in the batch", () => {
  let writes = 0;
  assert.throws(
    () =>
      publishPrepared(entries, {
        lookup: (spec) =>
          spec === "rocketicons@1.0.0"
            ? { ...published(entries[4]), dist: { integrity: "sha512-wrong" } }
            : null,
        publish: () => writes++
      }),
    /different files/
  );
  assert.equal(writes, 0);
});

test("missing metadata uses only an explicitly configured legacy token, preserving archives", () => {
  const manifest = { name: "@rocketicons/utils" };
  assert.deepEqual(publicationAuth(manifest, {}), { env: {}, args: [] });
  const env = {
    NODE_AUTH_TOKEN: "fixture-token",
    ACTIONS_ID_TOKEN_REQUEST_URL: "fixture-url",
    ACTIONS_ID_TOKEN_REQUEST_TOKEN: "fixture-request"
  };
  const auth = publicationAuth(manifest, env);
  assert.deepEqual(auth.args, ["--provenance=false"]);
  assert.deepEqual(auth.env, { NODE_AUTH_TOKEN: "fixture-token" });
  assert.equal(env.ACTIONS_ID_TOKEN_REQUEST_URL, "fixture-url");
  assert.deepEqual(publicationAuth(entries[0].manifest, env), { env, args: [] });
  assert.throws(
    () => publicationAuth({ ...manifest, repository: { url: "wrong" } }, env),
    /Unexpected repository/
  );
});

test("published packages must be confirmed after the npm command returns", () => {
  assert.throws(
    () => publishPrepared([entries[0]], { lookup: () => null, publish: () => {} }),
    /not confirmed/
  );
});

test("archive inspection checks the entire set and bundled catalog without running package scripts", (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), "rocketicons-publish-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(path.join(directory, "package/data"), { recursive: true });
  const createArchive = (entry, catalogVersion = "1.0.0") => {
    writeFileSync(
      path.join(directory, "package/package.json"),
      JSON.stringify({ ...entry.manifest, scripts: { prepublishOnly: "exit 99" } })
    );
    writeFileSync(
      path.join(directory, "package/data/search.json"),
      JSON.stringify({ packageVersion: catalogVersion })
    );
    execFileSync("tar", [
      "-czf",
      path.join(directory, `${entry.manifest.name.replace("@", "").replace("/", "-")}-1.0.0.tgz`),
      "-C",
      directory,
      "package"
    ]);
  };
  for (const entry of entries) createArchive(entry);
  const metadata = { name: "rocketicons", version: "1.0.0" };
  assert.deepEqual(
    readArchives(directory, metadata).map((entry) => entry.manifest.name),
    packageNames
  );
  assert.throws(
    () => readArchives(directory, { ...metadata, version: "2.0.0" }),
    /differs from release metadata/
  );
  createArchive(entries[2], "0.9.0");
  assert.throws(() => readArchives(directory, metadata), /Bundled catalog differs/);
});

test("scoped workspace manifests include the repository required by trusted publishing", () => {
  for (const name of ["utils", "tailwind", "toolkit", "mcp"]) {
    const manifest = JSON.parse(
      readFileSync(new URL(`../../packages/${name}/package.json`, import.meta.url), "utf8")
    );
    assert.deepEqual(manifest.repository, { ...repository, directory: `packages/${name}` });
  }
});
