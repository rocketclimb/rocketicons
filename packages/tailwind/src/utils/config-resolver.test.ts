import { describe, jest, expect, test } from "@jest/globals";
import { configResolver } from "./config-resolver";

import { Config } from "@/types";

const baseTwConfig = {
  content: [],
  theme: {}
};

const iconComponent = {
  default: "sky-500-base",
  baseStyle: "p-0 inline-block",
  variants: {
    filled: "",
    outlined: ""
  },
  sizes: {
    xs: "size-2",
    sm: "size-4",
    base: "size-5",
    lg: "size-6",
    xl: "size-7",
    "2xl": "size-8",
    "3xl": "size-9",
    "4xl": "size-10",
    "5xl": "size-11",
    "6xl": "size-12",
    "7xl": "size-14"
  }
};

const inputComponent = {
  default: "sky-600-xl",
  baseStyle: "p-1 block",
  variants: {
    filled: "m-1",
    outlined: "border-0"
  },
  sizes: {
    xs: "size-3",
    sm: "size-4",
    base: "size-5",
    lg: "size-6",
    xl: "size-7",
    "2xl": "size-8",
    "3xl": "size-9",
    "4xl": "size-10",
    "5xl": "size-11",
    "6xl": "size-12",
    "7xl": "size-14"
  }
};

const mockResolver =
  (config: Record<string, object>) =>
  (path?: string): Config =>
    (path ? config[path as keyof typeof config] : config) as Config;

describe("configHandler", () => {
  describe("options", () => {
    const twConfig = {
      ...baseTwConfig,
      components: {
        icon: undefined
      }
    };

    test("should call config", () => {
      const config = jest.fn(() => twConfig);
      configResolver("path", config as Config);
      expect(config).toBeCalledWith(undefined);
    });

    test("should call config using provided root path", () => {
      const config = jest.fn(() => twConfig);
      configResolver("path", config as Config, { rootPath: "components" });
      expect(config).toBeCalledWith("components");
    });

    test("should return default config", () => {
      const config = jest.fn(() => twConfig);
      const resolved = configResolver("path", config as Config, {
        rootPath: "components",
        defaultConfig: iconComponent
      });
      expect(resolved).toBe(iconComponent);
    });
  });

  describe("override", () => {
    test("Should return the config", () => {
      const config = jest.fn(
        mockResolver({
          components: {
            icon: iconComponent
          }
        })
      );
      expect(configResolver("icon", config as Config, { rootPath: "components" })).toBe(
        iconComponent
      );
    });
  });

  describe("extend", () => {
    test("Should return the extended config", () => {
      const config = jest.fn(
        mockResolver({
          ...baseTwConfig,
          extend: {
            components: {
              icon: {
                default: "sky-sm"
              }
            }
          }
        })
      );
      expect(
        configResolver("icon", config as Config, {
          rootPath: "components",
          defaultConfig: iconComponent
        })
      ).toEqual({ ...iconComponent, default: "sky-sm" });
    });

    test("Should return the extended config merged", () => {
      const config = jest.fn(
        mockResolver({
          ...baseTwConfig,
          extend: {
            components: {
              icon: {
                sizes: {
                  litle: "size-0.5",
                  xs: "size-1"
                }
              }
            }
          }
        })
      );
      expect(
        configResolver("icon", config as Config, {
          rootPath: "components",
          defaultConfig: iconComponent
        })
      ).toEqual({
        ...iconComponent,
        sizes: {
          litle: "size-0.5",
          xs: "size-1",
          sm: "size-4",
          base: "size-5",
          lg: "size-6",
          xl: "size-7",
          "2xl": "size-8",
          "3xl": "size-9",
          "4xl": "size-10",
          "5xl": "size-11",
          "6xl": "size-12",
          "7xl": "size-14"
        }
      });
    });

    test("Should return the extended config merged without mix values", () => {
      const config = jest.fn(
        mockResolver({
          ...baseTwConfig,
          extend: {
            components: {
              input: {
                sizes: {
                  "8xl": "size-15"
                }
              },
              icon: {
                sizes: {
                  litle: "size-0.5",
                  xs: "size-1"
                }
              }
            }
          }
        })
      );
      expect(
        configResolver("input", config as Config, {
          rootPath: "components",
          defaultConfig: inputComponent
        })
      ).toEqual({
        ...inputComponent,
        sizes: {
          xs: "size-3",
          sm: "size-4",
          base: "size-5",
          lg: "size-6",
          xl: "size-7",
          "2xl": "size-8",
          "3xl": "size-9",
          "4xl": "size-10",
          "5xl": "size-11",
          "6xl": "size-12",
          "7xl": "size-14",
          "8xl": "size-15"
        }
      });
      expect(
        configResolver("icon", config as Config, {
          rootPath: "components",
          defaultConfig: iconComponent
        })
      ).toEqual({
        ...iconComponent,
        sizes: {
          litle: "size-0.5",
          xs: "size-1",
          sm: "size-4",
          base: "size-5",
          lg: "size-6",
          xl: "size-7",
          "2xl": "size-8",
          "3xl": "size-9",
          "4xl": "size-10",
          "5xl": "size-11",
          "6xl": "size-12",
          "7xl": "size-14"
        }
      });
    });
  });
});
