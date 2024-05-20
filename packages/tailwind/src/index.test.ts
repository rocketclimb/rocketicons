import { describe, expect, test } from "@jest/globals";
import path from "path";
import fs from "fs";

import { Config } from "tailwindcss/types/config";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwindcss/defaultConfig";
import tailwind from "tailwindcss";
import postcss from "postcss";

import plugin from "./index";

const sourceCssFile = path.join(path.resolve(process.cwd()), "src/index.test.css");

describe("plugin", () => {
  test("Should generate the css", async () => {
    const expectation = fs.readFileSync(sourceCssFile);
    const config = resolveConfig({
      ...tailwindConfig,
      plugins: [plugin]
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
