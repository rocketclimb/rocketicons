import { createHash } from "node:crypto";
import type { IconDefinition } from "./types";

// The CI cache can restore a previous catalog. A plain "done" marker must never
// suppress fetching after a pinned revision or sparse-checkout path changes.
export const sourceCacheKey = (definitions: IconDefinition[]): string =>
  createHash("sha256")
    .update(JSON.stringify(definitions.map(({ source }) => source).filter(Boolean)))
    .digest("hex");
