import plugin from "tailwindcss/plugin";

import type { CssInJs, PluginAPI } from "@/types";
import getDefaultTheme from "./theme";
import { stylesGenerator } from "./utils/styles-generator";
import { configHandler } from "./utils/config-handler";

const pluginFactory = (isNative: boolean = false) => {
  return plugin(
    ({ addComponents, theme }: PluginAPI) => {
      const handler = configHandler(theme);

      const themeConfig = handler("icon", getDefaultTheme());

      const generator = stylesGenerator("icon", isNative);

      const styles = generator
        .add(themeConfig.defaults())
        .add(themeConfig.sizes())
        .add(themeConfig.colors())
        .add(themeConfig.shortcuts())
        .styles() as CssInJs;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addComponents(styles as any);
    },
    {
      safelist: isNative ? ["icon-default", "icon-filled", "icon-outlined"] : ["icon-default"]
    }
  );
};

export const nativeIconPlugin = pluginFactory(true);
export const iconPlugin = pluginFactory();

export default iconPlugin;
