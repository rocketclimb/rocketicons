import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { mergeReleaseHistory } from "./release-sync.mjs";

function fixture(t, normal = false) {
  const directory = mkdtempSync(path.join(tmpdir(), "rocketicons-sync-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: directory,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    }).trim();
  const write = (file, content) => writeFileSync(path.join(directory, file), content);
  const commit = (message) => {
    git("add", ".");
    git("commit", "-m", message);
    return git("rev-parse", "HEAD");
  };
  git("init", "-b", "main");
  git("config", "user.name", "Release test");
  git("config", "user.email", "test@example.invalid");
  write("package.json", '{"version":"0.9.0"}\n');
  write("code.txt", "base\n");
  commit("initial");
  git("switch", "-c", "develop");
  write("new-package.json", '{"version":"0.1.0"}\n');
  write("code.txt", "feature\n");
  const develop = commit("feature");
  git("switch", "-c", "release/0.10.0");
  write("package.json", '{"version":"0.10.0"}\n');
  write("new-package.json", '{"version":"0.2.0"}\n');
  const head = commit(
    "ci(releaser): bump packages versions and update changelog for release/0.10.0"
  );
  git("switch", "main");
  if (normal) git("merge", "--no-ff", "release/0.10.0", "-m", "release");
  else {
    git("merge", "--squash", "release/0.10.0");
    git("commit", "-m", "release (#262)");
  }
  const main = git("rev-parse", "HEAD");
  return {
    git,
    write,
    commit,
    directory,
    main,
    develop,
    release: { number: 262, merge_commit_sha: main, head: { ref: "release/0.10.0", sha: head } }
  };
}

test("reconnects a squash release that otherwise causes an add/add conflict", (t) => {
  const f = fixture(t);
  f.git("switch", "--detach", f.develop);
  assert.throws(() => f.git("merge", "--no-ff", "--no-edit", f.main));
  f.git("merge", "--abort");
  const merged = mergeReleaseHistory({ ...f, runGit: f.git });
  assert.equal(f.git("rev-parse", `${merged}^{tree}`), f.git("rev-parse", `${f.main}^{tree}`));
  f.git("merge-base", "--is-ancestor", f.main, merged);
  f.git("merge-base", "--is-ancestor", f.develop, merged);
  assert.equal(f.git("rev-parse", "main"), f.main);
});

test("preserves newer work on develop and a hotfix after the release on main", (t) => {
  const f = fixture(t);
  f.write("hotfix.txt", "main fix\n");
  const main = f.commit("hotfix");
  f.git("switch", "develop");
  f.write("feature.txt", "new feature\n");
  const develop = f.commit("next feature");
  mergeReleaseHistory({ ...f, main, develop, runGit: f.git });
  assert.equal(readFileSync(path.join(f.directory, "hotfix.txt"), "utf8"), "main fix\n");
  assert.equal(readFileSync(path.join(f.directory, "feature.txt"), "utf8"), "new feature\n");
  assert.equal(
    JSON.parse(readFileSync(path.join(f.directory, "new-package.json"))).version,
    "0.2.0"
  );
});

test("normal merge and an already synchronized branch need no bridge", (t) => {
  const f = fixture(t, true);
  const result = mergeReleaseHistory({ ...f, runGit: f.git });
  assert.equal(f.git("rev-list", "--count", `${f.main}..${result}`), "1");
  assert.equal(mergeReleaseHistory({ ...f, develop: result, runGit: f.git }), result);
});

test("real competing edits remain conflicts and abort the merge", (t) => {
  const f = fixture(t);
  f.write("code.txt", "main hotfix\n");
  const main = f.commit("hotfix");
  f.git("switch", "develop");
  f.write("code.txt", "develop edit\n");
  const develop = f.commit("competing edit");
  assert.throws(
    () => mergeReleaseHistory({ ...f, main, develop, runGit: f.git }),
    /conflicting edits/
  );
  assert.equal(f.git("rev-parse", "HEAD"), develop);
  assert.equal(f.git("status", "--porcelain"), "");
});

test("unverified tree or source ancestry is rejected before merging", (t) => {
  const f = fixture(t);
  f.write("unexpected.txt", "changed squash contents");
  const changed = f.commit("changed");
  assert.throws(
    () =>
      mergeReleaseHistory({
        ...f,
        main: changed,
        release: { ...f.release, merge_commit_sha: changed },
        runGit: f.git
      }),
    /differs from the prepared release/
  );
  const initial = f.git("rev-list", "--max-parents=0", "HEAD");
  assert.throws(
    () => mergeReleaseHistory({ ...f, develop: initial, runGit: f.git }),
    /source is not verified/
  );
});
