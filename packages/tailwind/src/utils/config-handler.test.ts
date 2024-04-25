import { describe, jest, expect, test, beforeAll } from "@jest/globals";
import { configHandler } from "./config-handler";
import expectations from "./config-handler.test.json";

import { Config, StyleHandler, ThemeOptions } from "@/types";

describe("configHandler", () => {
  describe("Styles", () => {
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

    const { baseExpectations, extendingExpectations, overrideExpectations } = expectations;

    describe("Theme tests", () => {
      describe.each([baseExpectations, extendingExpectations, overrideExpectations])(
        "$name mapping config",
        ({ config: customConfig, variants: expectedVariants, sizes: expectedSizes }) => {
          let variants: StyleHandler[];
          let sizes: StyleHandler[];

          beforeAll(() => {
            const spyConfig = jest.fn<Config>(((request: string) =>
              request === "components" ? customConfig : { colors }) as Config);
            //@ts-expect-error Config type enforcement
            const config = configHandler(spyConfig);
            const theme = config("icon", baseConfig);
            variants = theme.variants();
            sizes = theme.sizes();
          });

          describe("Variant mapping", () => {
            describe.each(expectedVariants)(
              "$name variant mapping",
              ({ name, styles, colors }) => {
                let variant: StyleHandler;
                let variantColors: StyleHandler[];

                beforeAll(() => {
                  variant = variants.shift()!;
                  variantColors = variant.options();
                });

                test(`Should map variant ${name}`, () => {
                  expect(variant.name()).toBe(name);
                  expect(variant.styles()).toBe(styles);
                });

                describe.each(colors)("$name color mapping", ({ name, styles, sizes }) => {
                  let color: StyleHandler;
                  let colorSizes: StyleHandler[];

                  beforeAll(() => {
                    color = variantColors.shift()!;
                    colorSizes = color.options();
                  });

                  test(`Should map color ${name}`, () => {
                    expect(color.name()).toBe(name);
                    expect(color.styles()).toBe(styles);
                  });

                  describe.each(sizes)("$name size mapping", ({ name, styles }) => {
                    let size: StyleHandler;

                    beforeAll(() => {
                      size = colorSizes.shift()!;
                    });

                    test(`Should map size ${name}`, () => {
                      expect(size.name()).toBe(name);
                      expect(size.styles()).toBe(styles);
                    });
                  });
                });
              }
            );
          });
          describe("Size mapping", () => {
            describe.each(expectedSizes)("$name size mapping", ({ name, styles }) => {
              let size: StyleHandler;

              beforeAll(() => {
                size = sizes.shift()!;
              });

              test(`Should map size ${name}`, () => {
                expect(size.name()).toBe(name);
                expect(size.styles()).toBe(styles);
              });
            });
          });
        }
      );
    });
  });
});
