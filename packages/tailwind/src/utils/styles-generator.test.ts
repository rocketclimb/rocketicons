import { describe, expect, test } from "@jest/globals";
import { StyleHandler } from "@/types";
import { stylesGenerator } from "./styles-generator";
import { CLASS_NAME_SEPARATOR } from "./config-handler";

const asStyle = (name: string, styles: string, variant: string = ""): StyleHandler => ({
  name: () => `${name}${variant && CLASS_NAME_SEPARATOR + variant}`,
  styles: () => styles
});

const asStyles = (name: string, styles: string, variant: string = ""): StyleHandler[] => [
  asStyle(name, styles, variant)
];

describe("stylesGenerator", () => {
  describe("styles", () => {
    describe("Web", () => {
      test("Should generate styles object", () => {
        const generator = stylesGenerator("icon");
        expect(
          generator
            .add(asStyles("default", "border w-1 h-1"))
            .add(asStyles("default", "stroke-primary", "outlined"))
            .add(asStyles("default", "fill-primary", "filled"))
            .add([
              asStyle("primary", "stroke-primary", "outlined"),
              asStyle("primary", "fill-primary", "filled"),
              asStyle("sm", "w-1 h-1"),
              asStyle("md", "w-2 h-2")
            ])
            .add([
              asStyle("primary-sm", "w-1 h-1"),
              asStyle("primary-sm", "stroke-primary", "outlined"),
              asStyle("primary-sm", "fill-primary", "filled"),
              asStyle("secondary-200-md", "w-2 h-2"),
              asStyle("secondary-200-md", "stroke-secondary-200", "outlined"),
              asStyle("secondary-200-md", "fill-secondary-200", "filled")
            ])
            .styles()
        ).toStrictEqual({
          ".icon-default": {
            width: "calc(var(--spacing) * 1)",
            height: "calc(var(--spacing) * 1)",
            "&.icon-outlined": { stroke: "var(--color-primary)" },
            "&.icon-filled": { fill: "var(--color-primary)" }
          },
          ".icon-primary": {
            "&.icon-ri.icon-outlined": { stroke: "var(--color-primary)" },
            "&.icon-ri.icon-filled": { fill: "var(--color-primary)" }
          },
          ".icon-sm": {
            "&.icon-ri": { width: "calc(var(--spacing) * 1)", height: "calc(var(--spacing) * 1)" }
          },
          ".icon-md": {
            "&.icon-ri": { width: "calc(var(--spacing) * 2)", height: "calc(var(--spacing) * 2)" }
          },
          ".icon-primary-sm": {
            "&.icon-ri": {
              width: "calc(var(--spacing) * 1)",
              height: "calc(var(--spacing) * 1)"
            },
            "&.icon-ri.icon-outlined": { stroke: "var(--color-primary)" },
            "&.icon-ri.icon-filled": { fill: "var(--color-primary)" }
          },
          ".icon-secondary-200-md": {
            "&.icon-ri": {
              width: "calc(var(--spacing) * 2)",
              height: "calc(var(--spacing) * 2)"
            },
            "&.icon-ri.icon-outlined": { stroke: "var(--color-secondary-200)" },
            "&.icon-ri.icon-filled": { fill: "var(--color-secondary-200)" }
          }
        });
      });
      test("Should remove empty styles object", () => {
        const generator = stylesGenerator("icon");
        expect(
          generator.add(asStyles("default", "")).add(asStyles(`default`, "w-1 h-1")).styles()
        ).toStrictEqual({
          ".icon-default": {
            width: "calc(var(--spacing) * 1)",
            height: "calc(var(--spacing) * 1)"
          }
        });
      });
    });
    describe("Native", () => {
      test("Should generate styles object", () => {
        const generator = stylesGenerator("icon", true);
        expect(
          generator
            .add(asStyles("default", "border w-1 h-1"))
            .add(asStyles("default", "stroke-primary", "outlined"))
            .add(asStyles("default", "fill-primary", "filled"))
            .add([
              asStyle("primary", "stroke-primary", "outlined"),
              asStyle("primary", "fill-primary", "filled"),
              asStyle("sm", "w-1 h-1"),
              asStyle("md", "w-2 h-2")
            ])
            .add([
              asStyle("primary-sm", "w-1 h-1"),
              asStyle("primary-sm", "stroke-primary", "outlined"),
              asStyle("primary-sm", "fill-primary", "filled"),
              asStyle("secondary-200-md", "w-2 h-2"),
              asStyle("secondary-200-md", "stroke-secondary-200", "outlined"),
              asStyle("secondary-200-md", "fill-secondary-200", "filled")
            ])
            .styles()
        ).toStrictEqual({
          ".icon-outlined": {
            "@apply fill-none !important": {}
          },
          ".icon-filled": {
            "@apply stroke-none !important": {}
          },
          ".icon-default": {
            "@apply border w-1 h-1 stroke-primary fill-primary": {}
          },
          ".icon-primary": {
            "@apply stroke-primary fill-primary": {}
          },
          ".icon-sm": {
            "@apply w-1 h-1": {}
          },
          ".icon-md": {
            "@apply w-2 h-2": {}
          },
          ".icon-primary-sm": {
            "@apply w-1 h-1 stroke-primary fill-primary": {}
          },
          ".icon-secondary-200-md": {
            "@apply w-2 h-2 stroke-secondary-200 fill-secondary-200": {}
          }
        });
      });
      test("Should remove empty styles object", () => {
        const generator = stylesGenerator("icon", true);
        expect(
          generator
            .add(asStyles("default", ""))
            .add(asStyles(`default`, "border w-1 h-1 stroke-primary fill-primary"))
            .styles()
        ).toStrictEqual({
          ".icon-outlined": {
            "@apply fill-none !important": {}
          },
          ".icon-filled": {
            "@apply stroke-none !important": {}
          },
          ".icon-default": {
            "@apply border w-1 h-1 stroke-primary fill-primary": {}
          }
        });
      });
    });
  });

  describe("Edge cases", () => {
    test("Should handle chaining multiple add calls", () => {
      const generator = stylesGenerator("icon");
      const result = generator
        .add(asStyles("default", "w-5 h-5"))
        .add(asStyles("xs", "w-2 h-2"))
        .add(asStyles("sm", "w-4 h-4"))
        .add(asStyles("lg", "w-6 h-6"))
        .styles();

      expect(result).toHaveProperty([".icon-default"]);
      expect(result).toHaveProperty([".icon-xs"]);
      expect(result).toHaveProperty([".icon-sm"]);
      expect(result).toHaveProperty([".icon-lg"]);
    });

    test("Should handle adding multiple styles to the same class", () => {
      const generator = stylesGenerator("icon");
      const result = generator
        .add(asStyles("default", "w-5 h-5"))
        .add(asStyles("default", "stroke-primary", "outlined"))
        .add(asStyles("default", "fill-primary", "filled"))
        .styles();

      const defaultClass = result[".icon-default"];
      expect(defaultClass).toHaveProperty("width");
      expect(defaultClass).toHaveProperty("height");
      expect(defaultClass).toHaveProperty(["&.icon-outlined"]);
      expect(defaultClass).toHaveProperty(["&.icon-filled"]);
    });

    test("Should preserve class name order across add calls", () => {
      const generator = stylesGenerator("icon");
      const result = generator
        .add(asStyles("default", "p-0"))
        .add(asStyles("sm", "h-4"))
        .add(asStyles("lg", "h-6"))
        .styles();

      const keys = Object.keys(result);
      expect(keys).toEqual([".icon-default", ".icon-sm", ".icon-lg"]);
    });

    test("Should use custom class prefix", () => {
      const generator = stylesGenerator("ri");
      const result = generator.add(asStyles("default", "w-5 h-5")).styles();

      expect(result).toHaveProperty([".ri-default"]);
      expect(result).not.toHaveProperty([".icon-default"]);
    });

    test("Should handle single style with no variants", () => {
      const generator = stylesGenerator("icon");
      const result = generator.add(asStyles("xl", "w-7 h-7")).styles();

      expect(result).toStrictEqual({
        ".icon-xl": {
          "&.icon-ri": { width: "calc(var(--spacing) * 7)", height: "calc(var(--spacing) * 7)" }
        }
      });
    });
  });

  describe("Native edge cases", () => {
    test("Should merge special props (w, h, stroke, fill) correctly in native mode", () => {
      const generator = stylesGenerator("icon", true);
      const result = generator
        .add(asStyles("default", "w-5 h-5"))
        .add(asStyles("default", "stroke-primary", "outlined"))
        .add(asStyles("default", "fill-primary", "filled"))
        .styles();

      // Native mode merges all styles into a single @apply
      const defaultStyles = result[".icon-default"];
      const applyKey = Object.keys(defaultStyles)[0];
      expect(applyKey).toContain("w-5");
      expect(applyKey).toContain("h-5");
      expect(applyKey).toContain("stroke-primary");
      expect(applyKey).toContain("fill-primary");
    });

    test("Should always include .icon-outlined and .icon-filled base classes in native mode", () => {
      const generator = stylesGenerator("icon", true);
      const result = generator.add(asStyles("default", "w-5 h-5")).styles();

      expect(result).toHaveProperty([".icon-outlined"]);
      expect(result).toHaveProperty([".icon-filled"]);

      // Verify the overrides are correct
      expect(result[".icon-outlined"]).toStrictEqual({ "@apply fill-none !important": {} });
      expect(result[".icon-filled"]).toStrictEqual({ "@apply stroke-none !important": {} });
    });

    test("Should skip 'default' variant suffixes in native mode", () => {
      const generator = stylesGenerator("icon", true);
      const result = generator.add([asStyle("default", "w-5 h-5", "default")]).styles();

      // The 'default' variant should be skipped, so only base classes exist
      const keys = Object.keys(result);
      expect(keys).toContain(".icon-outlined");
      expect(keys).toContain(".icon-filled");
      expect(keys).not.toContain(".icon-default-default");
    });
  });
});
