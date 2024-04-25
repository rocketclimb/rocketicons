import plugin from "tailwindcss/plugin";
import { PluginAPI } from "tailwindcss/types/config";

import DefaultTheme from "./theme";
import { stylesGenerator } from "./utils/styles-generator";
import { configHandler } from "./utils/config-handler";

export const iconPlugin = plugin(
  function ({ addComponents, config }: PluginAPI) {
    const handler = configHandler(config);
    const theme = handler("icon", DefaultTheme);
    const generator = stylesGenerator();
    const styles = generator.add(theme.variants()).add(theme.sizes()).styles();

    addComponents({
      [".icon-outlined"]: { ["@apply fill-none !important"]: {} },
      [".icon-filled"]: { ["@apply stroke-none !important"]: {} },
      ...styles
    });
  },
  {
    safelist: ["icon-default", "icon-filled", "icon-outlined"]
  }
);

export default iconPlugin;
