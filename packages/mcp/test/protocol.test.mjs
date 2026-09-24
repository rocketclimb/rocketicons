import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { resolve } from "node:path";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
  rmSync,
  existsSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

test("stdio tools and resources expose the icon workflow", async () => {
  const client = new Client({ name: "rocketicons-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve("dist/index.js")]
  });
  await client.connect(transport);
  try {
    const advertisedTools = (await client.listTools()).tools;
    const tools = advertisedTools.map(({ name }) => name);
    for (const name of [
      "search_icons",
      "recommend_icons",
      "get_icon",
      "get_icon_svg",
      "compare_icons",
      "get_icon_usage",
      "list_collections",
      "get_collection",
      "inspect_project",
      "doctor",
      "init_project",
      "plan_icons",
      "apply_icons",
      "add_icons",
      "remove_icons"
    ])
      assert.ok(tools.includes(name), `Missing ${name}`);
    const requiredFields = {
      search_icons: ["source", "catalogVersion", "results"],
      recommend_icons: ["projectPath", "searchSource", "results"],
      get_icon: ["id", "licenseUrl", "svgResource"],
      get_icon_svg: ["id", "mimeType", "svg"],
      compare_icons: ["source", "icons", "columns", "rows"],
      get_icon_usage: ["id", "generatedPath", "importStatement"],
      list_collections: ["catalogVersion", "collections"],
      get_collection: ["id", "licenseUrl", "resource"],
      inspect_project: ["projectPath", "initialized", "installedIconStatus"],
      doctor: ["projectPath", "healthy", "issues", "customizedIcons"],
      init_project: ["projectPath", "dryRun", "changes"],
      plan_icons: ["planId", "fileChanges", "dependencyEffects", "preservedIcons", "imports"],
      apply_icons: ["planId", "fileChanges", "dryRun"],
      add_icons: ["projectPath", "dryRun", "changes"],
      remove_icons: ["projectPath", "dryRun", "changes"]
    };
    for (const tool of advertisedTools) {
      assert.ok(requiredFields[tool.name], `No contract assertion for ${tool.name}`);
      assert.equal(tool.outputSchema?.type, "object", `${tool.name} needs an output schema`);
      for (const field of requiredFields[tool.name])
        assert.ok(
          tool.outputSchema.required?.includes(field),
          `${tool.name} must advertise ${field}`
        );
    }
    const search = await client.callTool({
      name: "search_icons",
      arguments: { query: "@fi/fi-calendar", collections: ["fi"] }
    });
    assert.equal(search.structuredContent.source, "local");
    assert.equal(search.structuredContent.results[0].id, "@fi/fi-calendar");
    const collections = await client.callTool({ name: "list_collections", arguments: {} });
    assert.ok(collections.structuredContent.collections.some(({ id }) => id === "fi"));
    const collection = await client.callTool({
      name: "get_collection",
      arguments: { collection_id: "fi" }
    });
    assert.equal(collection.structuredContent.id, "fi");
    const badCollection = await client.callTool({
      name: "search_icons",
      arguments: { query: "calendar", collections: ["missing-collection"] }
    });
    assert.equal(badCollection.isError, true);
    assert.equal(badCollection.structuredContent.error.code, "INVALID_FILTER");
    assert.match(badCollection.structuredContent.error.message, /Unknown collection/);
    assert.match(badCollection.structuredContent.error.nextStep, /list_collections/);
    assert.equal(
      badCollection.content[0].text,
      `INVALID_FILTER: ${badCollection.structuredContent.error.message}\nNext: ${badCollection.structuredContent.error.nextStep}`
    );
    const metadata = await client.callTool({
      name: "get_icon",
      arguments: { icon_id: "@fi/fi-calendar" }
    });
    assert.equal(metadata.structuredContent.license, "MIT");
    assert.ok(
      metadata.content.some(
        (item) =>
          item.type === "resource_link" && item.uri === "rocketicons://icons/fi/fi-calendar/svg"
      )
    );
    const directSvg = await client.callTool({
      name: "get_icon_svg",
      arguments: { icon_id: "@fi/fi-calendar" }
    });
    assert.equal(directSvg.structuredContent.id, "@fi/fi-calendar");
    assert.equal(directSvg.structuredContent.license, "MIT");
    assert.equal(directSvg.structuredContent.source, "local");
    assert.equal(directSvg.structuredContent.mimeType, "image/svg+xml");
    assert.equal(directSvg.content[0].text, directSvg.structuredContent.svg);
    assert.match(directSvg.content[0].text, /viewBox="0 0 24 24"/);
    assert.doesNotMatch(directSvg.content[0].text, /view-box=/);
    assert.match(directSvg.content[0].text, /xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    const renderedSvg = await sharp(Buffer.from(directSvg.content[0].text)).png().toBuffer();
    assert.ok(renderedSvg.length > 100);
    const missingSvg = await client.callTool({
      name: "get_icon_svg",
      arguments: { icon_id: "@fi/does-not-exist" }
    });
    assert.equal(missingSvg.isError, true);
    assert.equal(missingSvg.structuredContent.error.code, "ICON_NOT_FOUND");
    assert.match(missingSvg.content[0].text, /search_icons/);
    const comparison = await client.callTool({
      name: "compare_icons",
      arguments: { icon_ids: ["@fi/fi-calendar", "@fi/fi-camera"] }
    });
    assert.equal(comparison.structuredContent.source, "local");
    assert.deepEqual(
      comparison.structuredContent.icons.map(({ id, row, column }) => ({ id, row, column })),
      [
        { id: "@fi/fi-calendar", row: 0, column: 0 },
        { id: "@fi/fi-camera", row: 0, column: 1 }
      ]
    );
    const image = comparison.content.find((item) => item.type === "image");
    assert.equal(image.mimeType, "image/png");
    const png = Buffer.from(image.data, "base64");
    const imageMetadata = await sharp(png).metadata();
    assert.deepEqual([imageMetadata.width, imageMetadata.height], [480, 150]);
    const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual([info.width, info.height], [480, 150]);
    for (const offset of [0, 240]) {
      let darkPixels = 0;
      for (let y = 10; y < 90; y++)
        for (let x = offset + 80; x < offset + 160; x++) {
          const index = (y * info.width + x) * info.channels;
          if (data[index] < 200 && data[index + 1] < 200 && data[index + 2] < 200)
            darkPixels += 1;
        }
      assert.ok(darkPixels > 10, `Icon in cell ${offset / 240} did not render`);
    }
    assert.equal(comparison.content.filter((item) => item.type === "resource_link").length, 2);
    const five = await client.callTool({
      name: "compare_icons",
      arguments: {
        icon_ids: [
          "@fi/fi-calendar",
          "@fi/fi-camera",
          "@fi/fi-navigation",
          "@fi/fi-settings",
          "@fi/fi-home"
        ]
      }
    });
    assert.deepEqual([five.structuredContent.columns, five.structuredContent.rows], [3, 2]);
    const fivePng = Buffer.from(
      five.content.find((item) => item.type === "image").data,
      "base64"
    );
    const fiveImage = await sharp(fivePng).raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual([fiveImage.info.width, fiveImage.info.height], [720, 300]);
    const emptyCellPixel = (200 * fiveImage.info.width + 600) * fiveImage.info.channels;
    assert.deepEqual(
      [...fiveImage.data.subarray(emptyCellPixel, emptyCellPixel + 3)],
      [255, 255, 255]
    );
    const duplicate = await client.callTool({
      name: "compare_icons",
      arguments: { icon_ids: ["@fi/fi-calendar", "@fi/fi-calendar"] }
    });
    assert.equal(duplicate.isError, true);
    assert.match(duplicate.content[0].text, /duplicate icon IDs/);
    assert.equal(duplicate.structuredContent.error.code, "DUPLICATE_ICONS");
    const usage = await client.callTool({
      name: "get_icon_usage",
      arguments: { icon_id: "@fi/fi-calendar", target: "react", language: "js" }
    });
    assert.equal(usage.structuredContent.importStatement, null);
    assert.match(usage.structuredContent.importHint, /from_file/);
    const svg = await client.readResource({ uri: "rocketicons://icons/fi/fi-calendar/svg" });
    assert.equal(svg.contents[0].text, directSvg.content[0].text);
    const schema = await client.readResource({ uri: "rocketicons://schemas/config/v1" });
    assert.match(schema.contents[0].text, /catalogVersion/);
    const catalog = await client.readResource({ uri: "rocketicons://catalog/v1" });
    assert.match(catalog.contents[0].text, /collections/);
    const license = await client.readResource({ uri: "rocketicons://licenses/fi" });
    assert.match(license.contents[0].text, /MIT/);
    const root = mkdtempSync(join(tmpdir(), "rocketicons-mcp-protocol-"));
    try {
      writeFileSync(
        join(root, "package.json"),
        JSON.stringify({
          name: "fixture",
          version: "1",
          dependencies: {
            "@rocketicons/utils": "1",
            "@rocketicons/tailwind": "1",
            tailwindcss: "^4.2.1",
            "@tailwindcss/vite": "^4.2.1"
          }
        })
      );
      writeFileSync(join(root, "tsconfig.json"), '{"compilerOptions":{"jsx":"react-jsx"}}');
      mkdirSync(join(root, "src"));
      writeFileSync(join(root, "src/index.css"), '@import "tailwindcss";\n');
      writeFileSync(
        join(root, "vite.config.js"),
        'import tailwindcss from "@tailwindcss/vite";\nexport default { plugins: [tailwindcss()] };\n'
      );
      writeFileSync(
        join(root, "src/App.tsx"),
        'import "./index.css";\nexport default function App() { return null; }\n'
      );
      const uninitialized = await client.callTool({
        name: "add_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"] }
      });
      assert.equal(uninitialized.isError, true);
      assert.equal(uninitialized.structuredContent.error.code, "PROJECT_NOT_INITIALIZED");
      assert.match(uninitialized.structuredContent.error.nextStep, /init_project/);
      const preview = await client.callTool({
        name: "init_project",
        arguments: { project_path: root, dry_run: true }
      });
      assert.equal(preview.structuredContent.dryRun, true);
      assert.ok(preview.structuredContent.changes.some(({ path }) => path === "src/index.css"));
      assert.equal(existsSync(join(root, "rocketicons.json")), false);
      await client.callTool({ name: "init_project", arguments: { project_path: root } });
      const addPreview = await client.callTool({
        name: "add_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"], dry_run: true }
      });
      assert.equal(addPreview.structuredContent.changes.length, 2);
      await client.callTool({
        name: "add_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"] }
      });
      const recommendation = await client.callTool({
        name: "recommend_icons",
        arguments: {
          project_path: root,
          intent: "@fi/fi-calendar",
          from_file: "src/App.tsx",
          limit: 3
        }
      });
      assert.match(recommendation.content[0].text, /installed icon/);
      assert.equal(recommendation.structuredContent.results[0].id, "@fi/fi-calendar");
      assert.equal(recommendation.structuredContent.results[0].action, "reuse");
      assert.deepEqual(recommendation.structuredContent.searchedCollections, ["fi"]);
      assert.match(
        recommendation.structuredContent.results[0].usage.web.importStatement,
        /FiCalendar/
      );
      assert.match(
        recommendation.structuredContent.results[0].usage.reactNative.example,
        /FiCalendar/
      );
      const health = await client.callTool({ name: "doctor", arguments: { project_path: root } });
      assert.equal(health.structuredContent.healthy, true);
      assert.equal(health.structuredContent.styling.pluginRegistered, true);
      assert.equal(health.structuredContent.styling.stylesheetLoaded, true);
      const componentPath = join(root, "src/ri/icons/fi-calendar.tsx");
      const generatedComponent = readFileSync(componentPath, "utf8");
      appendFileSync(componentPath, "// owned edit\n");
      const customized = await client.callTool({
        name: "doctor",
        arguments: { project_path: root }
      });
      assert.equal(customized.structuredContent.healthy, true);
      assert.deepEqual(customized.structuredContent.customizedIcons, ["@fi/fi-calendar"]);
      assert.match(customized.content[0].text, /Customized icons preserved: @fi\/fi-calendar/);
      const customizedInspection = await client.callTool({
        name: "inspect_project",
        arguments: { project_path: root }
      });
      assert.equal(
        customizedInspection.structuredContent.installedIconStatus["@fi/fi-calendar"],
        "customized"
      );
      assert.match(customizedInspection.content[0].text, /customized icons: @fi\/fi-calendar/);
      const reuse = await client.callTool({
        name: "recommend_icons",
        arguments: { project_path: root, intent: "@fi/fi-calendar", from_file: "src/App.tsx" }
      });
      assert.equal(reuse.structuredContent.results[0].action, "reuse");
      assert.equal(reuse.structuredContent.results[0].installedStatus, "customized");
      const preserved = await client.callTool({
        name: "plan_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"], from_file: "src/App.tsx" }
      });
      assert.equal(preserved.structuredContent.preservedIcons[0].status, "customized");
      assert.match(preserved.content[0].text, /Existing icons preserved/);
      assert.ok(
        !preserved.structuredContent.fileChanges.some(
          ({ path }) => path === "src/ri/icons/fi-calendar.tsx"
        )
      );
      const protectedRemoval = await client.callTool({
        name: "remove_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"] }
      });
      assert.equal(protectedRemoval.isError, true);
      writeFileSync(componentPath, generatedComponent);
      await client.callTool({
        name: "remove_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"] }
      });
      writeFileSync(join(root, "src/index.css"), '@import "tailwindcss";\n');
      const stylingDiagnosis = await client.callTool({
        name: "doctor",
        arguments: { project_path: root }
      });
      assert.equal(stylingDiagnosis.structuredContent.healthy, false);
      assert.equal(stylingDiagnosis.structuredContent.styling.pluginRegistered, false);
      assert.match(stylingDiagnosis.content[0].text, /src\/index.css.*@plugin/);
      const inspection = await client.callTool({
        name: "inspect_project",
        arguments: { project_path: root }
      });
      assert.equal(Object.keys(inspection.structuredContent.manifest.icons).length, 0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  } finally {
    await client.close();
  }
});

test("recommend, plan, and apply work in a Vite project without a bundler alias", async () => {
  const client = new Client({ name: "rocketicons-plan-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve("dist/index.js")]
  });
  const root = mkdtempSync(join(tmpdir(), "rocketicons-mcp-plan-"));
  await client.connect(transport);
  try {
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({
        name: "vite-no-alias",
        version: "1",
        dependencies: {
          "@rocketicons/utils": "1",
          "@rocketicons/tailwind": "1",
          tailwindcss: "^4.2.1",
          "@tailwindcss/vite": "^4.2.1"
        }
      })
    );
    writeFileSync(join(root, "tsconfig.json"), '{"compilerOptions":{"jsx":"react-jsx"}}');
    writeFileSync(
      join(root, "vite.config.js"),
      'import tailwindcss from "@tailwindcss/vite";\nexport default { plugins: [tailwindcss()] };\n'
    );
    const source = "src/App.tsx";
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src/index.css"), '@import "tailwindcss";\n');
    writeFileSync(
      join(root, source),
      'import "./index.css";\nexport default function App() { return null; }\n'
    );
    const recommendation = await client.callTool({
      name: "recommend_icons",
      arguments: { project_path: root, intent: "@fi/fi-calendar", from_file: source }
    });
    assert.equal(recommendation.structuredContent.results[0].action, "add");
    const plan = await client.callTool({
      name: "plan_icons",
      arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"], from_file: source }
    });
    const details = plan.structuredContent;
    assert.match(plan.content[0].text, /src\/ri\/icons\/fi-calendar.tsx/);
    assert.ok(details.fileChanges.some(({ path }) => path === "src/ri/icons/fi-calendar.tsx"));
    assert.ok(details.fileChanges.some(({ path }) => path === "src/index.css"));
    assert.deepEqual(details.toInstall, []);
    assert.equal(existsSync(join(root, "rocketicons.json")), false);
    const preview = await client.callTool({
      name: "apply_icons",
      arguments: {
        project_path: root,
        icon_ids: ["@fi/fi-calendar"],
        from_file: source,
        plan_id: details.planId,
        dry_run: true
      }
    });
    assert.equal(preview.structuredContent.dryRun, true);
    assert.equal(existsSync(join(root, "rocketicons.json")), false);
    const applied = await client.callTool({
      name: "apply_icons",
      arguments: {
        project_path: root,
        icon_ids: ["@fi/fi-calendar"],
        from_file: source,
        plan_id: details.planId
      }
    });
    assert.equal(applied.structuredContent.verification.healthy, true);
    assert.equal(
      applied.structuredContent.imports[0].importStatement,
      'import FiCalendar from "./ri/icons/fi-calendar";'
    );
    assert.equal(existsSync(join(root, "src/ri/icons/fi-calendar.tsx")), true);
    const stale = await client.callTool({
      name: "apply_icons",
      arguments: {
        project_path: root,
        icon_ids: ["@fi/fi-calendar"],
        from_file: source,
        plan_id: details.planId
      }
    });
    assert.equal(stale.isError, true);
    assert.equal(stale.structuredContent.error.code, "STALE_PLAN");
    assert.match(stale.structuredContent.error.nextStep, /plan_icons/);
    const usage = await client.callTool({
      name: "get_icon_usage",
      arguments: { icon_id: "@fi/fi-calendar", project_path: root, from_file: source }
    });
    assert.equal(
      usage.structuredContent.importStatement,
      applied.structuredContent.imports[0].importStatement
    );
  } finally {
    await client.close();
    rmSync(root, { recursive: true, force: true });
  }
});

test("rocketicons mcp starts the same stdio server", async () => {
  const client = new Client({ name: "rocketicons-cli-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve("../icons/bin/index.js"), "mcp"]
  });
  await client.connect(transport);
  try {
    const tools = (await client.listTools()).tools.map(({ name }) => name);
    assert.ok(tools.includes("search_icons"));
    const search = await client.callTool({
      name: "search_icons",
      arguments: { query: "@fi/fi-calendar" }
    });
    assert.equal(search.structuredContent.results[0].id, "@fi/fi-calendar");
  } finally {
    await client.close();
  }
});
