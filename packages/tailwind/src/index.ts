import plugin from "tailwindcss/plugin";
import { CSSRuleObject, PluginAPI } from "tailwindcss/types/config";

import getDefaultTheme from "./theme";
import { stylesGenerator } from "./utils/styles-generator";
import { configHandler } from "./utils/config-handler";

const pluginFactory = (isNative: boolean = false) => {
  return plugin(
    ({ addComponents, config }: PluginAPI) => {
      const prefix = (config("prefix") as string) ?? "";
      const handler = configHandler(config, prefix);

      const theme = handler("icon", getDefaultTheme(prefix));

      const generator = stylesGenerator("icon", isNative);

      const styles = generator
        .add(theme.defaults())
        .add(theme.sizes())
        .add(theme.colors())
        .add(theme.shortcuts())
        .styles() as CSSRuleObject;

      addComponents(styles);
    },
    {
      safelist: isNative ? ["icon-default", "icon-filled", "icon-outlined"] : ["icon-default"]
    }
  );
};

export const nativeIconPlugin = pluginFactory(true);
export const iconPlugin = pluginFactory();

export default iconPlugin;
