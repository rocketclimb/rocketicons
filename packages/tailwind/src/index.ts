import plugin from "tailwindcss/plugin";
import { CSSRuleObject, PluginAPI } from "tailwindcss/types/config";

import DefaultTheme from "./theme";
import { stylesGenerator } from "./utils/styles-generator";
import { configHandler } from "./utils/config-handler";

export const iconPlugin = plugin(
  function ({ addComponents, config }: PluginAPI) {
    const prefix = config("prefix") ?? "";
    const classPrefix = `${prefix}icon`;
    const handler = configHandler(config);
    const theme = handler("icon", DefaultTheme);
    const generator = stylesGenerator(classPrefix);
    const styles = generator
      .add(theme.defaults())
      .add(theme.sizes())
      .add(theme.colors())
      .add(theme.shortcuts())
      .styles() as CSSRuleObject;

    addComponents(styles);
  },
  {
    safelist: ["icon-default", "icon-filled", "icon-outlined"]
  }
);

export default iconPlugin;
