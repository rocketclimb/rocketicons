import { describe, expect, test, beforeAll } from "@jest/globals";
import { configHandler, DEFAULT_CLASS_NAME } from "./config-handler";

import { StyleHandler, ThemeOptions } from "@/types";

type TestingStyles = {
  defaults: StyleHandler[];
  sizes: StyleHandler[];
  colors: StyleHandler[];
  shortcuts: StyleHandler[];
};

type Expectation = {
  name: keyof TestingStyles;
  values: [string, string][];
};

type TestExpectations = {
  name: string;
  config: object;
  expectations: Expectation[];
};

describe("configHandler - Theme tests", () => {
  const colors = {
    primary: {
      "500": "#ffffff"
    },
    secondary: {
      "200": "#f1f1f1"
    },
    tertiary: {
      "500": "#f2f2f2",
      DEFAULT: "#f3fef3"
    },
    quaternary: "#f4f4f4"
  };

  const baseConfig: ThemeOptions = {
    default: "secondary-lg",
    baseStyle: "p1",
    variants: {
      outlined: "border",
      filled: "center"
    },
    sizes: {
      sm: "w-1 h-1",
      md: "w-2 h-2",
      lg: "w-4 h-4"
    }
  };

  const sizeExpectations: Expectation = {
    name: "sizes",
    values: [
      ["sm", "w-1 h-1"],
      ["md", "w-2 h-2"],
      ["lg", "w-4 h-4"]
    ]
  };

  const colorsExpectations: Expectation = {
    name: "colors",
    values: [
      ["primary.outlined", "stroke-primary-500"],
      ["primary-500.outlined", "stroke-primary-500"],
      ["secondary.outlined", "stroke-secondary-200"],
      ["secondary-200.outlined", "stroke-secondary-200"],
      ["tertiary.outlined", "stroke-tertiary"],
      ["tertiary-500.outlined", "stroke-tertiary-500"],
      ["quaternary.outlined", "stroke-quaternary"],
      ["primary.filled", "fill-primary-500"],
      ["primary-500.filled", "fill-primary-500"],
      ["secondary.filled", "fill-secondary-200"],
      ["secondary-200.filled", "fill-secondary-200"],
      ["tertiary.filled", "fill-tertiary"],
      ["tertiary-500.filled", "fill-tertiary-500"],
      ["quaternary.filled", "fill-quaternary"]
    ]
  };

  const shortcutsExpectations: Expectation = {
    name: "shortcuts",
    values: [
      ["primary-sm", "w-1 h-1"],
      ["primary-sm.outlined", "stroke-primary-500"],
      ["primary-sm.filled", "fill-primary-500"],
      ["primary-md", "w-2 h-2"],
      ["primary-md.outlined", "stroke-primary-500"],
      ["primary-md.filled", "fill-primary-500"],
      ["primary-lg", "w-4 h-4"],
      ["primary-lg.outlined", "stroke-primary-500"],
      ["primary-lg.filled", "fill-primary-500"],
      ["primary-500-sm", "w-1 h-1"],
      ["primary-500-sm.outlined", "stroke-primary-500"],
      ["primary-500-sm.filled", "fill-primary-500"],
      ["primary-500-md", "w-2 h-2"],
      ["primary-500-md.outlined", "stroke-primary-500"],
      ["primary-500-md.filled", "fill-primary-500"],
      ["primary-500-lg", "w-4 h-4"],
      ["primary-500-lg.outlined", "stroke-primary-500"],
      ["primary-500-lg.filled", "fill-primary-500"],
      ["secondary-sm", "w-1 h-1"],
      ["secondary-sm.outlined", "stroke-secondary-200"],
      ["secondary-sm.filled", "fill-secondary-200"],
      ["secondary-md", "w-2 h-2"],
      ["secondary-md.outlined", "stroke-secondary-200"],
      ["secondary-md.filled", "fill-secondary-200"],
      ["secondary-lg", "w-4 h-4"],
      ["secondary-lg.outlined", "stroke-secondary-200"],
      ["secondary-lg.filled", "fill-secondary-200"],
      ["secondary-200-sm", "w-1 h-1"],
      ["secondary-200-sm.outlined", "stroke-secondary-200"],
      ["secondary-200-sm.filled", "fill-secondary-200"],
      ["secondary-200-md", "w-2 h-2"],
      ["secondary-200-md.outlined", "stroke-secondary-200"],
      ["secondary-200-md.filled", "fill-secondary-200"],
      ["secondary-200-lg", "w-4 h-4"],
      ["secondary-200-lg.outlined", "stroke-secondary-200"],
      ["secondary-200-lg.filled", "fill-secondary-200"],
      ["tertiary-sm", "w-1 h-1"],
      ["tertiary-sm.outlined", "stroke-tertiary"],
      ["tertiary-sm.filled", "fill-tertiary"],
      ["tertiary-md", "w-2 h-2"],
      ["tertiary-md.outlined", "stroke-tertiary"],
      ["tertiary-md.filled", "fill-tertiary"],
      ["tertiary-lg", "w-4 h-4"],
      ["tertiary-lg.outlined", "stroke-tertiary"],
      ["tertiary-lg.filled", "fill-tertiary"],
      ["tertiary-500-sm", "w-1 h-1"],
      ["tertiary-500-sm.outlined", "stroke-tertiary-500"],
      ["tertiary-500-sm.filled", "fill-tertiary-500"],
      ["tertiary-500-md", "w-2 h-2"],
      ["tertiary-500-md.outlined", "stroke-tertiary-500"],
      ["tertiary-500-md.filled", "fill-tertiary-500"],
      ["tertiary-500-lg", "w-4 h-4"],
      ["tertiary-500-lg.outlined", "stroke-tertiary-500"],
      ["tertiary-500-lg.filled", "fill-tertiary-500"],
      ["quaternary-sm", "w-1 h-1"],
      ["quaternary-sm.outlined", "stroke-quaternary"],
      ["quaternary-sm.filled", "fill-quaternary"],
      ["quaternary-md", "w-2 h-2"],
      ["quaternary-md.outlined", "stroke-quaternary"],
      ["quaternary-md.filled", "fill-quaternary"],
      ["quaternary-lg", "w-4 h-4"],
      ["quaternary-lg.outlined", "stroke-quaternary"],
      ["quaternary-lg.filled", "fill-quaternary"]
    ]
  };

  const baseExpectations = [sizeExpectations, colorsExpectations, shortcutsExpectations];

  const expectations: TestExpectations[] = [
    {
      name: "Base",
      config: {},
      expectations: [
        {
          name: "defaults",
          values: [
            [DEFAULT_CLASS_NAME, "p1"],
            [`${DEFAULT_CLASS_NAME}`, "w-4 h-4"],
            ["default.outlined", "border stroke-secondary-200"],
            ["default.filled", "center fill-secondary-200"]
          ]
        },
        ...baseExpectations
      ]
    },
    {
      name: "Override",
      config: {
        icon: {
          default: "secondary-sm",
          sizes: {
            sm: "w-1 h-1",
            md: "w-2 h-2"
          }
        }
      },
      expectations: [
        {
          name: "defaults",
          values: [
            [DEFAULT_CLASS_NAME, ""],
            [`${DEFAULT_CLASS_NAME}`, "w-1 h-1"],
            ["default.outlined", "stroke-secondary-200"],
            ["default.filled", "fill-secondary-200"]
          ]
        },
        {
          name: "sizes",
          values: [
            ["sm", "w-1 h-1"],
            ["md", "w-2 h-2"]
          ]
        },
        colorsExpectations,
        {
          name: "shortcuts",
          values: [
            ["primary-sm", "w-1 h-1"],
            ["primary-sm.outlined", "stroke-primary-500"],
            ["primary-sm.filled", "fill-primary-500"],
            ["primary-md", "w-2 h-2"],
            ["primary-md.outlined", "stroke-primary-500"],
            ["primary-md.filled", "fill-primary-500"],

            ["primary-500-sm", "w-1 h-1"],
            ["primary-500-sm.outlined", "stroke-primary-500"],
            ["primary-500-sm.filled", "fill-primary-500"],
            ["primary-500-md", "w-2 h-2"],
            ["primary-500-md.outlined", "stroke-primary-500"],
            ["primary-500-md.filled", "fill-primary-500"],

            ["secondary-sm", "w-1 h-1"],
            ["secondary-sm.outlined", "stroke-secondary-200"],
            ["secondary-sm.filled", "fill-secondary-200"],
            ["secondary-md", "w-2 h-2"],
            ["secondary-md.outlined", "stroke-secondary-200"],
            ["secondary-md.filled", "fill-secondary-200"],

            ["secondary-200-sm", "w-1 h-1"],
            ["secondary-200-sm.outlined", "stroke-secondary-200"],
            ["secondary-200-sm.filled", "fill-secondary-200"],
            ["secondary-200-md", "w-2 h-2"],
            ["secondary-200-md.outlined", "stroke-secondary-200"],
            ["secondary-200-md.filled", "fill-secondary-200"],

            ["tertiary-sm", "w-1 h-1"],
            ["tertiary-sm.outlined", "stroke-tertiary"],
            ["tertiary-sm.filled", "fill-tertiary"],
            ["tertiary-md", "w-2 h-2"],
            ["tertiary-md.outlined", "stroke-tertiary"],
            ["tertiary-md.filled", "fill-tertiary"],

            ["tertiary-500-sm", "w-1 h-1"],
            ["tertiary-500-sm.outlined", "stroke-tertiary-500"],
            ["tertiary-500-sm.filled", "fill-tertiary-500"],
            ["tertiary-500-md", "w-2 h-2"],
            ["tertiary-500-md.outlined", "stroke-tertiary-500"],
            ["tertiary-500-md.filled", "fill-tertiary-500"],

            ["quaternary-sm", "w-1 h-1"],
            ["quaternary-sm.outlined", "stroke-quaternary"],
            ["quaternary-sm.filled", "fill-quaternary"],
            ["quaternary-md", "w-2 h-2"],
            ["quaternary-md.outlined", "stroke-quaternary"],
            ["quaternary-md.filled", "fill-quaternary"]
          ]
        }
      ]
    }
  ];

  const resolve = (styles: StyleHandler[]) =>
    styles.map(({ name, styles }) => ({
      name: name(),
      styles: styles()
    }));

  const expects = (...expectations: [string, string][]) =>
    expectations.map(([name, styles]) => ({ name, styles }));

  describe.each(expectations)(
    "$name mapping config",
    ({ config: customConfig, expectations }) => {
      const styles: TestingStyles = {
        defaults: [],
        sizes: [],
        colors: [],
        shortcuts: []
      };

      beforeAll(() => {
        // In TW v4, configHandler takes theme() instead of config()
        // We mock theme() to return colors and component config
        const mockTheme = ((path: string) => {
          if (path === "colors") return colors;
          if (path.startsWith("components.")) {
            const componentKey = path.replace("components.", "");
            const components = customConfig as Record<string, unknown>;
            return components[componentKey] ?? null;
          }
          return null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;

        const config = configHandler(mockTheme);
        const theme = config("icon", baseConfig);

        styles.defaults = theme.defaults();
        styles.sizes = theme.sizes();
        styles.colors = theme.colors();
        styles.shortcuts = theme.shortcuts();
      });
      describe.each(expectations)("$name mapping", ({ name, values }) => {
        test(`Should map ${name}`, () => {
          expect(resolve(styles[name])).toEqual(expects(...values));
        });
      });
    }
  );
});

describe("configHandler - Edge cases", () => {
  const resolve = (styles: StyleHandler[]) =>
    styles.map(({ name, styles }) => ({
      name: name(),
      styles: styles()
    }));

  const createMockTheme = (colors: object, componentOverride?: object) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((path: string) => {
      if (path === "colors") return colors;
      if (path.startsWith("components.")) {
        return componentOverride ?? null;
      }
      return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

  describe("Empty colors", () => {
    test("Should handle empty colors object gracefully", () => {
      const handler = configHandler(createMockTheme({}));
      const theme = handler("icon", {
        default: "blue-500-base",
        baseStyle: "p-0 inline-block",
        sizes: { base: "h-5 w-5" }
      });

      expect(theme.colors()).toEqual([]);
      expect(theme.shortcuts()).toEqual([]);
      expect(theme.sizes().length).toBe(1);
      expect(theme.defaults().length).toBe(4); // default + size + outlined + filled
    });
  });

  describe("Null colors from theme lookup", () => {
    test("Should handle null colors without crashing", () => {
      const handler = configHandler(createMockTheme(null as unknown as object));
      const theme = handler("icon", {
        default: "primary-base",
        sizes: { base: "h-5 w-5" }
      });

      expect(theme.colors()).toEqual([]);
      expect(theme.shortcuts()).toEqual([]);
    });
  });

  describe("Single string color (no variants)", () => {
    test("Should handle string colors without shade variants", () => {
      const handler = configHandler(
        createMockTheme({
          inherit: "inherit",
          current: "currentColor",
          transparent: "transparent"
        })
      );
      const theme = handler("icon", {
        default: "inherit-base",
        sizes: { base: "h-5 w-5" }
      });

      const colors = resolve(theme.colors());

      // String colors should map directly (no -500 suffix)
      expect(colors).toContainEqual({ name: "inherit.outlined", styles: "stroke-inherit" });
      expect(colors).toContainEqual({ name: "inherit.filled", styles: "fill-inherit" });
      expect(colors).toContainEqual({ name: "current.outlined", styles: "stroke-current" });
      expect(colors).toContainEqual({ name: "transparent.filled", styles: "fill-transparent" });
    });
  });

  describe("Colors with DEFAULT value", () => {
    test("Should use color name without suffix when DEFAULT exists", () => {
      const handler = configHandler(
        createMockTheme({
          brand: {
            DEFAULT: "#ff0000",
            "100": "#ffe0e0",
            "900": "#330000"
          }
        })
      );
      const theme = handler("icon", {
        default: "brand-base",
        sizes: { base: "h-5 w-5" }
      });

      const colors = resolve(theme.colors());

      // DEFAULT means the base color name maps to itself (no -500)
      expect(colors).toContainEqual({ name: "brand.outlined", styles: "stroke-brand" });
      expect(colors).toContainEqual({ name: "brand.filled", styles: "fill-brand" });
      // Variant shades should still be expanded
      expect(colors).toContainEqual({ name: "brand-100.outlined", styles: "stroke-brand-100" });
      expect(colors).toContainEqual({ name: "brand-900.filled", styles: "fill-brand-900" });
    });
  });

  describe("Theme with no baseStyle", () => {
    test("Should generate empty baseStyle for defaults", () => {
      const handler = configHandler(createMockTheme({ primary: "#000" }));
      const theme = handler("icon", {
        default: "primary-sm",
        sizes: { sm: "h-4", md: "h-6" }
      });

      const defaults = resolve(theme.defaults());

      // First default entry should have empty style when baseStyle is undefined
      expect(defaults[0]).toEqual({ name: "default", styles: "" });
    });
  });

  describe("Theme with no variants", () => {
    test("Should generate variant defaults using empty variant styles", () => {
      const handler = configHandler(createMockTheme({ primary: "#000" }));
      const theme = handler("icon", {
        default: "primary-base",
        sizes: { base: "h-5 w-5" }
      });

      const defaults = resolve(theme.defaults());
      const outlinedDefault = defaults.find((d) => d.name === "default.outlined");
      const filledDefault = defaults.find((d) => d.name === "default.filled");

      // Without variants config, just the stroke/fill class with no extra styles
      expect(outlinedDefault?.styles).toBe("stroke-primary");
      expect(filledDefault?.styles).toBe("fill-primary");
    });
  });

  describe("Colors with 500 shade (auto-default)", () => {
    test("Should auto-select 500 shade as the default color mapping", () => {
      const handler = configHandler(
        createMockTheme({
          blue: { "100": "#dbeafe", "500": "#3b82f6", "900": "#1e3a8a" }
        })
      );
      const theme = handler("icon", {
        default: "blue-base",
        sizes: { base: "h-5 w-5" }
      });

      const colors = resolve(theme.colors());

      // blue should auto-map to blue-500
      expect(colors).toContainEqual({ name: "blue.outlined", styles: "stroke-blue-500" });
      expect(colors).toContainEqual({ name: "blue.filled", styles: "fill-blue-500" });
    });
  });

  describe("Colors without 500 shade (first shade fallback)", () => {
    test("Should fall back to first shade when 500 is not available", () => {
      const handler = configHandler(
        createMockTheme({
          custom: { "50": "#fafafa", "700": "#3f3f46" }
        })
      );
      const theme = handler("icon", {
        default: "custom-base",
        sizes: { base: "h-5 w-5" }
      });

      const colors = resolve(theme.colors());

      // Should fall back to first key (50)
      expect(colors).toContainEqual({ name: "custom.outlined", styles: "stroke-custom-50" });
      expect(colors).toContainEqual({ name: "custom.filled", styles: "fill-custom-50" });
    });
  });

  describe("Multiple sizes with sanitization", () => {
    test("Should sanitize extra whitespace in size values", () => {
      const handler = configHandler(createMockTheme({ red: "#f00" }));
      const theme = handler("icon", {
        default: "red-base",
        sizes: { base: "  h-5   w-5  " }
      });

      const sizes = resolve(theme.sizes());
      expect(sizes[0].styles).toBe("h-5 w-5");
    });
  });

  describe("Compound default color-size", () => {
    test("Should correctly split compound default like sky-500-base", () => {
      const handler = configHandler(
        createMockTheme({
          sky: { "500": "#0ea5e9" }
        })
      );
      const theme = handler("icon", {
        default: "sky-500-base",
        baseStyle: "p-0 inline-block",
        sizes: { base: "h-5 w-5", lg: "h-6 w-6" }
      });

      const defaults = resolve(theme.defaults());
      const outlinedDefault = defaults.find((d) => d.name === "default.outlined");

      // sky-500 is the color, base is the size
      expect(outlinedDefault?.styles).toBe("stroke-sky-500");
      expect(defaults[1]).toEqual({ name: "default", styles: "h-5 w-5" });
    });
  });
});
