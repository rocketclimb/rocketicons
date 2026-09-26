import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  packageNames,
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

test("a partial retry skips matching packages and publishes remaining dependencies in order", async () => {
  const registry = new Map([[entries[0].manifest.name, published(entries[0])]]);
  const writes = [];
  await publishPrepared(entries, {
    lookup: (spec) => registry.get(spec.slice(0, spec.lastIndexOf("@"))) ?? null,
    publish: (archive) => {
      const entry = entries.find((item) => item.archive === archive);
      writes.push(entry.manifest.name);
      registry.set(entry.manifest.name, published(entry));
    }
  });
  assert.deepEqual(writes, packageNames.slice(1));
});

test("a later package mismatch prevents every publication in the batch", async () => {
  let writes = 0;
  await assert.rejects(
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

test("publication that races a manual publish resumes only for the same archive", async () => {
  for (const matching of [true, false]) {
    let reads = 0;
    const operation = publishPrepared([entries[0]], {
      lookup: () =>
        ++reads === 1
          ? null
          : {
              ...published(entries[0]),
              dist: { integrity: matching ? entries[0].integrity : "sha512-different" }
            },
      publish: () => {
        throw new Error("You cannot publish over the previously published versions");
      },
      wait: () => {}
    });
    if (matching) await operation;
    else await assert.rejects(operation, /different files/);
  }
});

test("a temporarily stale registry read after publishing recovers without republishing", async () => {
  let reads = 0;
  let writes = 0;
  const waits = [];
  await publishPrepared([entries[0]], {
    lookup: () => (++reads < 4 ? null : published(entries[0])),
    publish: () => writes++,
    wait: (ms) => waits.push(ms)
  });
  assert.equal(writes, 1);
  assert.deepEqual(waits, [2000, 2000]);
});

test("publication failures still fail if the expected version never appears", async () => {
  await assert.rejects(
    publishPrepared([entries[0]], {
      lookup: () => null,
      publish: () => {
        throw new Error("npm E403: permission denied");
      },
      wait: () => {}
    }),
    /permission denied/
  );
  await assert.rejects(
    publishPrepared([entries[0]], {
      lookup: () => null,
      publish: () => {},
      wait: () => {}
    }),
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
