import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function refreshHead(pr, branch) {
  if (pr.state !== "OPEN" || pr.baseRefName !== "main" || pr.headRefName !== branch) {
    throw new Error(
      "Refresh requires an open release PR targeting main with the calculated release branch"
    );
  }
  if (!/^[a-f0-9]{40}$/.test(pr.headRefOid)) throw new Error("Invalid release PR head");
  return pr.headRefOid;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(refreshHead(JSON.parse(fs.readFileSync(process.argv[2], "utf8")), process.argv[3]));
}
