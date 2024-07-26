import plugin from "tailwindcss/plugin";
import { CSSRuleObject, PluginAPI } from "tailwindcss/types/config";

import DefaultTheme from "./theme";
import { stylesGenerator } from "./utils/styles-generator";
import { configHandler } from "./utils/config-handler";
import { ThemeOptions } from "./types";

const addPrefixToTheme = (theme: ThemeOptions, prefix: string): ThemeOptions => {
  const baseStyleClasses = theme.baseStyle?.split(" ") ?? [];

  const baseStyle = baseStyleClasses.reduce((acc: string, value) => {
    return (acc += `${prefix}${value} `);
  }, "");

  const sizes = Object.entries(theme.sizes).reduce(
    (acc: { [key: string]: string }, [key, value]) => {
      const sizeClasses = value.split(" ") ?? [];

      const newClassesArray = sizeClasses.reduce((acc: string[], value) => {
        return [...acc, `${prefix}${value}`];
      }, []);

      acc[key] = newClassesArray.join(" ");
      return acc;
    },
    {}
  );

  return {
    ...theme,
    baseStyle,
    sizes
  };
};

const pluginFactory = (isNative: boolean = false) => {
  return plugin(
    ({ addComponents, config }: PluginAPI) => {
      const prefix = (config("prefix") as string) ?? "";
      const themeModified = addPrefixToTheme(DefaultTheme, prefix);

      const handler = configHandler(config, prefix);
      const theme = handler("icon", themeModified);

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
