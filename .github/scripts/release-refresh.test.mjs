import assert from "node:assert/strict";
import test from "node:test";
import { refreshHead } from "./release-refresh.mjs";

const pr = {
  state: "OPEN",
  baseRefName: "main",
  headRefName: "release/0.10.0",
  headRefOid: "a".repeat(40)
};
test("refresh identifies the exact open release head for a leased update", () => {
  assert.equal(refreshHead(pr, "release/0.10.0"), pr.headRefOid);
});
test("refresh rejects closed PRs, different versions, wrong targets, and invalid heads", () => {
  for (const change of [
    { state: "MERGED" },
    { state: "CLOSED" },
    { baseRefName: "develop" },
    { headRefName: "release/0.9.4" },
    { headRefOid: "" }
  ]) {
    assert.throws(() => refreshHead({ ...pr, ...change }, "release/0.10.0"));
  }
});
