import plugin from "tailwindcss/plugin";

// TW v4's plugin module defines PluginAPI internally but doesn't export it directly.
// We infer PluginAPI from the createPlugin function's handler parameter.
type PluginCreator = typeof plugin;
type PluginHandler = Parameters<PluginCreator>[0];
export type PluginAPI = Parameters<PluginHandler>[0];

export type CssInJs = Record<string, Record<string, object> | string>;

export type Style = Record<string, Record<string, object>>;

export type Generator = {
  generator: (className: string, styles: string) => void;
  styles: () => Style;
};

export interface ThemeOptions {
  default?: string;
  baseStyle?: string;
  variants?: Record<string, string>;
  sizes: Record<string, string>;
}

export type ThemeOption = keyof ThemeOptions;
export type ThemeProp = Record<string, string>;

export type ThemeConfig<T extends ThemeOptions> = Record<string, T>;
export type ThemeProperties<T extends ThemeOptions> = keyof ThemeConfig<T>;

export type StyleOptions = { variant: string; color?: string; size?: string };

export type Defaults = {
  defaultColor: string;
  defaultSize: string;
};

export type ThemeLookup = PluginAPI["theme"];
export type ConfigProp = string | Record<string, string | string[]>;

export type StyleHandler = {
  name: () => string;
  styles: () => string;
};

export type DefaultStyleHandler = {
  colors: () => StyleHandler[];
  sizes: () => StyleHandler[];
};

export type Theme = {
  defaults: () => StyleHandler[];
  sizes: () => StyleHandler[];
  colors: () => StyleHandler[];
  shortcuts: () => StyleHandler[];
};

export type ThemeHandler<T extends ThemeOptions> = (
  property: ThemeProperties<T>,
  defaultTheme: ThemeOptions
) => Theme;

export type ParsedColors = Record<string, string>;
