import { describe, expect, test, beforeAll } from "@jest/globals";
import path from "path";
import postcss from "postcss";

// TW v4 uses @tailwindcss/postcss as the PostCSS integration
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const tailwindcss = require("@tailwindcss/postcss");

const pkgRoot = path.resolve(process.cwd());

const processCSS = async (extraDirectives: string = "") => {
  const pluginPath = path.join(pkgRoot, "dist/index.js");
  const css = `
    @import "tailwindcss";
    @plugin "${pluginPath}";
    ${extraDirectives}
  `;
  return postcss([tailwindcss()]).process(css, {
    from: path.join(pkgRoot, "test-input.css")
  });
};

// TW v4 tree-shakes addComponents() output — only classes that are
// safelisted or detected in content are included. We use @source inline
// to force detection of all icon classes in our integration tests.
const ALL_ICON_CLASSES = [
  "icon-default",
  "icon-xs",
  "icon-sm",
  "icon-base",
  "icon-lg",
  "icon-xl",
  "icon-2xl",
  "icon-3xl",
  "icon-4xl",
  "icon-5xl",
  "icon-6xl",
  "icon-7xl",
  "icon-outlined",
  "icon-filled",
  "icon-ri"
].join(" ");

describe("plugin", () => {
  describe("web", () => {
    let outputCSS: string;

    beforeAll(async () => {
      const result = await processCSS(`@source inline("${ALL_ICON_CLASSES}");`);
      outputCSS = result.css;
    });

    describe("default class", () => {
      test("Should generate .icon-default with display: inline-block", () => {
        expect(outputCSS).toContain(".icon-default");
        expect(outputCSS).toContain("display: inline-block");
      });

      test("Should generate .icon-default with padding: 0", () => {
        // TW v4 may output padding: 0 (no px for zero values)
        expect(outputCSS).toMatch(/padding:\s*0(px)?/);
      });

      test("Should include .icon-ri root class for variant scoping", () => {
        expect(outputCSS).toContain(".icon-ri");
      });
    });

    describe("size classes", () => {
      const expectedSizes = [
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl",
        "7xl"
      ];

      test.each(expectedSizes)("Should generate .icon-%s size class", (size) => {
        expect(outputCSS).toContain(`.icon-${size}`);
      });

      test("Should generate height CSS properties for size classes", () => {
        expect(outputCSS).toContain("height:");
      });

      test("Should generate width CSS properties for size classes", () => {
        expect(outputCSS).toContain("width:");
      });
    });

    describe("variant classes", () => {
      test("Should generate .icon-outlined variant class", () => {
        expect(outputCSS).toContain(".icon-outlined");
      });

      test("Should generate .icon-filled variant class", () => {
        expect(outputCSS).toContain(".icon-filled");
      });

      test("Should generate stroke CSS rules for outlined variant", () => {
        expect(outputCSS).toContain("stroke:");
      });

      test("Should generate fill CSS rules for filled variant", () => {
        expect(outputCSS).toContain("fill:");
      });
    });

    describe("color classes", () => {
      test("Should generate default sky color classes", () => {
        // The default theme uses sky-500 as the default color
        expect(outputCSS).toMatch(/sky/);
      });
    });
  });

  describe("safelisted classes", () => {
    let outputCSS: string;

    beforeAll(async () => {
      // No @source inline — only safelisted classes should appear
      const result = await processCSS();
      outputCSS = result.css;
    });

    test("Should always include safelisted icon-default class", () => {
      expect(outputCSS).toContain(".icon-default");
    });

    test("Should include base styles for safelisted class", () => {
      expect(outputCSS).toContain("display: inline-block");
    });
  });

  describe("CSS output structure", () => {
    let outputCSS: string;

    beforeAll(async () => {
      const result = await processCSS(`@source inline("${ALL_ICON_CLASSES}");`);
      outputCSS = result.css;
    });

    test("Should not contain unresolved @apply directives", () => {
      // TW v4 should resolve all @apply inside addComponents()
      expect(outputCSS).not.toContain("@apply");
    });

    test("Should generate valid CSS with no Tailwind directives remaining", () => {
      expect(outputCSS).not.toContain("@tailwind");
      expect(outputCSS).not.toContain("@plugin");
    });

    test("Should contain @layer for TW v4 layer organization", () => {
      // TW v4 wraps output in CSS layers
      expect(outputCSS).toMatch(/@layer/);
    });

    test("Should produce substantial output with multiple icon selectors", () => {
      // With @source inline providing all class names, we should get many selectors
      const iconSelectors = (outputCSS.match(/\.icon-/g) || []).length;
      expect(iconSelectors).toBeGreaterThan(10);
    });
  });

  // Note on TW v4 prefix support:
  // TW v4 automatically handles prefix for addComponents() output.
  // Users configure prefix via: @import "tailwindcss" prefix(xp);
  // The plugin's generated selectors (.icon-default etc.) are automatically
  // prefixed by TW v4's engine (e.g., .xp\:icon-default).
  // No manual prefix handling is needed in the plugin JS code.
  // @apply inside plugins resolves unprefixed utility names correctly.
});
