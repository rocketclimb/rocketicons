import test from "node:test";
import assert from "node:assert/strict";
import { errorResult, outputs, toolError } from "../dist/contracts.js";

const icon = {
  id: "@fi/fi-calendar",
  name: "Calendar",
  component: "FiCalendar",
  collection: "fi",
  collectionName: "Feather Icons",
  variant: "outlined",
  license: "MIT",
  licenseUrl: "https://example.com/license",
  svgResource: "rocketicons://icons/fi/fi-calendar/svg"
};

test("output schemas require the fields agents need to identify and choose an icon", () => {
  assert.equal(outputs.get_icon.safeParse(icon).success, true);
  assert.equal(outputs.get_icon.safeParse({ ...icon, licenseUrl: undefined }).success, false);

  const search = {
    source: "local",
    catalogVersion: "1.0.0",
    results: [{ ...icon, matchReason: "Exact icon ID" }]
  };
  assert.equal(outputs.search_icons.safeParse(search).success, true);
  assert.equal(
    outputs.search_icons.safeParse({ ...search, results: [{ ...icon }] }).success,
    false
  );
  assert.equal(
    outputs.search_icons.safeParse({ ...search, source: "unexpected" }).success,
    false
  );
  assert.equal(
    outputs.get_icon_svg.safeParse({
      ...icon,
      source: "local",
      mimeType: "image/svg+xml",
      svg: "<svg/>"
    }).success,
    true
  );
  assert.equal(
    outputs.get_icon_svg.safeParse({ ...icon, source: "local", mimeType: "image/svg+xml" })
      .success,
    false
  );
});

test("actionable error categories retain a machine code and a readable next step", () => {
  const cases = [
    ["Unknown icon: missing", "ICON_NOT_FOUND", /search_icons/],
    ["Ambiguous icon calendar; use one of @fi/fi-calendar", "ICON_AMBIGUOUS", /exact/],
    ["Unknown collection: missing", "INVALID_FILTER", /list_collections/],
    ["Invalid variant: ???", "INVALID_FILTER", /valid variant/],
    ["remove duplicate icon IDs", "DUPLICATE_ICONS", /compare_icons/],
    ["Plan is stale or does not match", "STALE_PLAN", /plan_icons/],
    [
      "Project is not initialized; run init_project first",
      "PROJECT_NOT_INITIALIZED",
      /init_project/
    ],
    ["Project catalog version differs from installed catalog", "CATALOG_MISMATCH", /compatible/],
    ["project_path must be absolute", "PROJECT_INVALID", /absolute project_path/],
    ["Refusing to overwrite unmanaged or edited file: icon.tsx", "FILE_CONFLICT", /doctor/],
    ["from_file must identify an existing source file", "SOURCE_FILE_INVALID", /existing/],
    ["target is required without project_path", "MISSING_CONTEXT", /target/],
    ["Unexpected failure", "TOOL_FAILED", /retry/]
  ];
  for (const [message, code, nextStep] of cases) {
    const detail = toolError(new Error(message));
    assert.equal(detail.code, code, message);
    assert.equal(detail.message, message);
    assert.match(detail.nextStep, nextStep);
    const result = errorResult(new Error(message));
    assert.equal(result.isError, true);
    assert.deepEqual(result.structuredContent.error, detail);
    assert.equal(result.content[0].text, `${code}: ${message}\nNext: ${detail.nextStep}`);
  }
});
