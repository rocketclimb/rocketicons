import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("retired previews point to the canonical site", async () => {
  const [redirects, html] = await Promise.all([
    readFile(new URL("../preview-closed/_redirects", import.meta.url), "utf8"),
    readFile(new URL("../preview-closed/index.html", import.meta.url), "utf8")
  ]);

  assert.equal(redirects, "/* https://rocketicons.com/:splat 302\n");
  assert.match(html, /href="https:\/\/rocketicons\.com"/);
  assert.doesNotMatch(html, /rocketicons\.io/);
});
