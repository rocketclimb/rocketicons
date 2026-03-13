import { describe, expect, test } from "@jest/globals";
import path from "path";
import postcss from "postcss";

// TW v4 uses @tailwindcss/postcss as the PostCSS integration
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const tailwindcss = require("@tailwindcss/postcss");

const pkgRoot = path.resolve(process.cwd());

describe("plugin", () => {
  describe("web", () => {
    test("Should generate the css with icon component classes", async () => {
      const pluginPath = path.join(pkgRoot, "dist/index.js");
      const css = `
        @import "tailwindcss";
        @plugin "${pluginPath}";
      `;
      const result = await postcss([tailwindcss()]).process(css, {
        from: path.join(pkgRoot, "test-input.css")
      });

      // Verify the output contains our icon component classes
      expect(result.css).toContain(".icon-default");
      expect(result.css).toContain("display: inline-block");
      // TW v4 may output padding: 0 (without px unit for zero values)
      expect(result.css).toMatch(/padding:\s*0(px)?/);

      // Verify size classes exist
      expect(result.css).toContain(".icon-xs");
      expect(result.css).toContain(".icon-sm");
      expect(result.css).toContain(".icon-base");
      expect(result.css).toContain(".icon-lg");
      expect(result.css).toContain(".icon-xl");
      expect(result.css).toContain(".icon-2xl");
      expect(result.css).toContain(".icon-7xl");

      // Verify color-related classes exist
      expect(result.css).toContain(".icon-outlined");
      expect(result.css).toContain(".icon-filled");

      // Verify it generates stroke/fill rules
      expect(result.css).toContain("stroke:");
      expect(result.css).toContain("fill:");
    });

    test("Should generate the default icon class with correct styling", async () => {
      const pluginPath = path.join(pkgRoot, "dist/index.js");
      const css = `
        @import "tailwindcss";
        @plugin "${pluginPath}";
      `;
      const result = await postcss([tailwindcss()]).process(css, {
        from: path.join(pkgRoot, "test-input.css")
      });

      // Verify default icon has base styles
      expect(result.css).toContain(".icon-default");
      // Default icon should use the .icon-ri root class for variants
      expect(result.css).toContain(".icon-ri");
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
