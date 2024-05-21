import { describe, expect, test } from "@jest/globals";
import path from "path";
import fs from "fs";

import { Config } from "tailwindcss/types/config";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwindcss/defaultConfig";
import tailwind from "tailwindcss";
import postcss from "postcss";

import { iconPlugin, nativeIconPlugin } from "./index";

const sourceCssFile = path.join(path.resolve(process.cwd()), "src/index.test.css");
const sourceNativeCssFile = path.join(path.resolve(process.cwd()), "src/index.native.test.css");

describe("plugin", () => {
  describe("web", () => {
    test("Should generate the css without creating a giant bundler", async () => {
      const expectation = fs.readFileSync(sourceCssFile);
      const config = resolveConfig({
        ...tailwindConfig,
        plugins: [iconPlugin]
      });
      const { css } = await postcss([tailwind(config as unknown as Config)]).process(
        "@tailwind components;",
        {
          from: undefined
        }
      );
      expect(css).toBe(expectation.toString().slice(0, 202));
    });

    test("Should generate the css", async () => {
      const expectation = fs.readFileSync(sourceCssFile);
      const config = resolveConfig({
        ...tailwindConfig,
        plugins: [iconPlugin],
        safelist: [
          {
            pattern: /icon-*/
          }
        ]
      });
      const { css } = await postcss([tailwind(config as unknown as Config)]).process(
        "@tailwind components;",
        {
          from: undefined
        }
      );
      expect(css).toBe(expectation.toString());
    });
  });

  describe("native", () => {
    test("Should generate the native css without creating a giant bundler", async () => {
      const expectation = fs.readFileSync(sourceNativeCssFile);
      const config = resolveConfig({
        ...tailwindConfig,
        plugins: [nativeIconPlugin]
      });
      const { css } = await postcss([tailwind(config as unknown as Config)]).process(
        "@tailwind components;",
        {
          from: undefined
        }
      );
      expect(css).toBe(expectation.toString().slice(0, 232));
    });
    test("Should generate the native css", async () => {
      const expectation = fs.readFileSync(sourceNativeCssFile);
      const config = resolveConfig({
        ...tailwindConfig,
        plugins: [nativeIconPlugin],
        safelist: [
          {
            pattern: /icon-*/
          }
        ]
      });
      const { css } = await postcss([tailwind(config as unknown as Config)]).process(
        "@tailwind components;",
        {
          from: undefined
        }
      );
      expect(css).toBe(expectation.toString());
    });
  });
});
