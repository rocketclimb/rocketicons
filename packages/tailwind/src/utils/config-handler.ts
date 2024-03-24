import { PluginAPI } from "tailwindcss/types/config";

export interface ThemeOptions {
  default?: string;
  baseStyle?: string;
  variants?: Record<string, string>;
  sizes: Record<string, string>;
}

type ThemeConfig<T extends ThemeOptions> = Record<string, T>;
type ThemeProperties<T extends ThemeOptions> = keyof ThemeConfig<T>;

type StyleOptions = { variant: string; color?: string; size?: string };

type Defaults = {
  defaultColor: string;
  defaultSize: string;
};

const AVAILABLE_VARIANTS = ["outlined", "filled"];

export const DEFAULT_CLASS_NAME = "default";

export type Config = PluginAPI["config"];

export type StyleHandler = {
  variant: () => string;
  name: () => string;
  styles: () => string;
  options: () => StyleHandler[];
};

export type DefaultStyleHandler = {
  variants: () => StyleHandler[];
  colors: () => StyleHandler[];
  sizes: () => StyleHandler[];
};

export type Theme = {
  variants: () => StyleHandler[];
  sizes: () => StyleHandler[];
};

export type ThemeHandler<T extends ThemeOptions> = (
  property: ThemeProperties<T>,
  defaultTheme: ThemeOptions
) => Theme;

export const configHandler = <T extends ThemeOptions>(
  config: Config
): ThemeHandler<T> => {
  const customConfig = config("components");
  const themeColors = config("theme").colors;

  const getColorDefaults = (color: string, variants: string | any) => {
    if (typeof variants === "string" || variants.DEFAULT) {
      return color;
    }

    return (
      (variants["500"] && `${color}-500`) ||
      `${color}-${Object.keys(variants).shift()}`
    );
  };

  const colorVariantsReducer = (color: string, variants: string | object) =>
    typeof variants === "object"
      ? Object.keys(variants)
          .filter((key) => key !== "DEFAULT")
          .reduce(
            (reduced, key) => ({
              ...reduced,
              [`${color}-${key}`]: `${color}-${key}`,
            }),
            {}
          )
      : {};

  const parsedColors: Record<string, string> = Object.entries(
    themeColors || {}
  ).reduce(
    (reduced, [key, value]) => ({
      ...reduced,
      [key]: getColorDefaults(key, value as string | object),
      ...colorVariantsReducer(key, value as string | object),
    }),
    {}
  );

  const isExtending = customConfig && !!customConfig["extends"];
  const themeConfig = (isExtending && customConfig["extends"]) || customConfig;

  const themeHandler = (defaultTheme: ThemeOptions, custom?: T): T => {
    const hasCustomConfig = custom && Object.keys(custom).length;

    const getNewProperties = (baseConfig: any, customConfig: any): T =>
      Object.entries(customConfig)
        .filter(([key]) => !baseConfig[key])
        .reduce(
          (reduced, [key, entry]) => ({ ...reduced, [key]: entry }),
          {}
        ) as T;

    const parseProperty = (value: any, defaults: any) =>
      value === undefined
        ? defaults
        : typeof value === "object"
        ? deepMerge(defaults, value)
        : value;

    const deepMerge = (baseConfig: any, customConfig: any): T =>
      Object.keys(baseConfig).reduce(
        (reduced, key) => ({
          ...reduced,
          [key]: parseProperty(
            customConfig && customConfig[key],
            baseConfig[key]
          ),
        }),
        getNewProperties(baseConfig, customConfig) as T
      );

    const handleCustomConfig = (): T =>
      isExtending ? deepMerge(defaultTheme!, custom) : (custom as T);

    return (!hasCustomConfig ? defaultTheme : handleCustomConfig()) as T;
  };

  return (property: ThemeProperties<T>, defaultTheme: ThemeOptions) => {
    const theme = themeHandler(
      defaultTheme,
      themeConfig && themeConfig[property]
    );

    const getDefaults = (): Defaults => {
      const pieces = theme.default!.split("-");
      const defaultSize = pieces.pop()!;
      return { defaultColor: pieces.join("-"), defaultSize };
    };

    const { defaultColor, defaultSize } = getDefaults();

    const sizeVariants = () =>
      ([] as StyleHandler[]).concat(
        ...AVAILABLE_VARIANTS.map((variant) => sizes(variant))
      );

    const variants = () =>
      AVAILABLE_VARIANTS.map((variant) => ({
        variant: () => variant,
        name: () => DEFAULT_CLASS_NAME,
        styles: () => stylesFor({ variant }),
        options: () => [...colors(variant), ...sizes(variant)],
      }));

    const colors = (variant: string) =>
      Object.keys(parsedColors).map((color) => ({
        variant: () => variant,
        name: () => color,
        styles: () => stylesFor({ variant, color }),
        options: () => sizes(variant, color),
      }));

    const sizes = (variant: string, color?: string) =>
      Object.keys(theme.sizes).map((size) => ({
        variant: () => variant,
        name: () => size,
        styles: () => stylesFor({ variant, color, size }),
        options: () => [] as StyleHandler[],
      }));

    const sanitize = (classes: string): string =>
      classes.trim().replace(/\s{2,}/g, " ");

    const stylesFor = ({ variant, color, size }: StyleOptions) => {
      color = color || defaultColor;
      size = size || defaultSize;
      const currentStyle = (theme.variants && theme.variants[variant]) || "";
      const currentColorStyle = (color && parsedColors[color]) || "";
      const appliedColor = `fill-${currentColorStyle} stroke-${currentColorStyle}`;
      return sanitize(
        `${theme.baseStyle || ""} ${currentStyle || ""} ${appliedColor || ""} ${
          theme.sizes[size] || ""
        }`
      );
    };

    return {
      variants,
      sizes: () => sizeVariants(),
    };
  };
};
