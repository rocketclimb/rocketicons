import { describe, jest, expect, test, beforeAll } from "@jest/globals";
import { configHandler, DEFAULT_CLASS_NAME } from "./config-handler";

import { Config, StyleHandler, ThemeOptions } from "@/types";

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
      name: "Extends New Default Color",
      config: {
        extend: {
          icon: {
            default: "tertiary-500-lg"
          }
        }
      },
      expectations: [
        {
          name: "defaults",
          values: [
            [DEFAULT_CLASS_NAME, "p1"],
            [`${DEFAULT_CLASS_NAME}`, "w-4 h-4"],
            ["default.outlined", "border stroke-tertiary-500"],
            ["default.filled", "center fill-tertiary-500"]
          ]
        },
        ...baseExpectations
      ]
    },
    {
      name: "Extends New Default Size",
      config: {
        extend: {
          icon: {
            default: "tertiary-500-md"
          }
        }
      },
      expectations: [
        {
          name: "defaults",
          values: [
            [DEFAULT_CLASS_NAME, "p1"],
            [`${DEFAULT_CLASS_NAME}`, "w-2 h-2"],
            ["default.outlined", "border stroke-tertiary-500"],
            ["default.filled", "center fill-tertiary-500"]
          ]
        },
        sizeExpectations,
        colorsExpectations,
        shortcutsExpectations
      ]
    },
    {
      name: "Extends New Default",
      config: {
        extend: {
          icon: {
            default: "secondary-md"
          }
        }
      },
      expectations: [
        {
          name: "defaults",
          values: [
            [DEFAULT_CLASS_NAME, "p1"],
            [`${DEFAULT_CLASS_NAME}`, "w-2 h-2"],
            ["default.outlined", "border stroke-secondary-200"],
            ["default.filled", "center fill-secondary-200"]
          ]
        },
        sizeExpectations,
        colorsExpectations,
        shortcutsExpectations
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
        const spyConfig = jest.fn<Config>(((request: string) =>
          request === "components" ? customConfig : { colors }) as Config);
        //@ts-expect-error Config type enforcement
        const config = configHandler(spyConfig);
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
