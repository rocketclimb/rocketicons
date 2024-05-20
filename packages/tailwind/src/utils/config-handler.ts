import {
  Config,
  ThemeOptions,
  ThemeHandler,
  ThemeProperties,
  Defaults,
  StyleHandler,
  ConfigProp,
  ThemeConfig,
  ThemeOption,
  ThemeProp,
  ParsedColors
} from "@/types";

const AVAILABLE_VARIANTS = ["outlined", "filled"] as const;
type Variant = (typeof AVAILABLE_VARIANTS)[number];

const VARIANT_CLASSES: Record<Variant, "stroke" | "fill"> = {
  outlined: "stroke",
  filled: "fill"
};

export const DEFAULT_CLASS_NAME = "default";
export const CLASS_NAME_SEPARATOR = ".";

const sanitize = (classes: string): string => classes.trim().replace(/\s{2,}/g, " ");

const toColorsStyles = (parsedColors: ParsedColors, variant: Variant) =>
  ([] as StyleHandler[]).concat(
    ...Object.entries(parsedColors).map(([name, color]) => ({
      name: () => `${name}${CLASS_NAME_SEPARATOR}${variant}`,
      styles: () => `${VARIANT_CLASSES[variant]}-${color}`
    }))
  );

const toShortCutStyles = (theme: ThemeOptions, name: string, color: string) =>
  ([] as StyleHandler[]).concat(
    ...Object.keys(theme.sizes).map((size) =>
      ([] as StyleHandler[]).concat([
        {
          name: () => `${name}-${size}`,
          styles: () => sanitize(theme.sizes[size])
        },
        ...AVAILABLE_VARIANTS.map((variant) => ({
          name: () => `${name}-${size}${CLASS_NAME_SEPARATOR}${variant}`,
          styles: () => `${VARIANT_CLASSES[variant]}-${color}`
        }))
      ])
    )
  );

const themeHandler = <T extends ThemeOptions>(
  isExtending: boolean,
  defaultTheme: ThemeOptions,
  custom?: T
): T => {
  const hasCustomConfig = !!(custom && Object.keys(custom).length);

  const getNewProperties = (baseConfig: ThemeOptions | ThemeProp, customConfig: T): T =>
    (Object.entries(customConfig) as [ThemeOption, ThemeOptions][])
      .filter(([key]) => !baseConfig[key])
      .reduce((reduced, [key, entry]) => ({ ...reduced, [key]: entry }), {}) as T;

  const parseProperty = (value: ConfigProp | undefined | T, defaults?: string | ThemeProp) => {
    if (value === undefined) {
      return defaults;
    }

    return typeof value === "object" ? deepMerge(defaults as ThemeProp, value as T) : value;
  };

  const deepMerge = (baseConfig: ThemeOptions | ThemeProp, customConfig: T): T =>
    (Object.keys(baseConfig) as ThemeOption[]).reduce(
      (reduced, key) => ({
        ...reduced,
        [key]: parseProperty(customConfig && customConfig[key], baseConfig[key])
      }),
      getNewProperties(baseConfig, customConfig) as T
    );

  const handleCustomConfig = (): T =>
    isExtending ? deepMerge(defaultTheme, custom!) : (custom as T);

  return (!hasCustomConfig ? defaultTheme : handleCustomConfig()) as T;
};

const generateConfig = <T extends ThemeOptions>(theme: T, parsedColors: ParsedColors) => {
  const getDefaults = (): Defaults => {
    const pieces = theme.default!.split("-");
    const defaultSize = pieces.pop()!;
    return { defaultColor: pieces.join("-"), defaultSize };
  };

  const { defaultColor, defaultSize } = getDefaults();

  const colors = () =>
    ([] as StyleHandler[]).concat(
      ...AVAILABLE_VARIANTS.map((variant) => toColorsStyles(parsedColors, variant))
    );

  const sizes = () =>
    ([] as StyleHandler[]).concat(
      ([] as StyleHandler[]).concat(
        ...Object.keys(theme.sizes).map((size) => ({
          name: () => `${size}`,
          styles: () => sanitize(theme.sizes[size])
        }))
      )
    );

  const defaults = () => [
    {
      name: () => DEFAULT_CLASS_NAME,
      styles: () => sanitize(`${theme.baseStyle ?? ""}`)
    },
    {
      name: () => `${DEFAULT_CLASS_NAME}`,
      styles: () => sanitize(`${theme.sizes[defaultSize]}`)
    },
    ...AVAILABLE_VARIANTS.map((variant) => ({
      variant: () => variant,
      name: () => `${DEFAULT_CLASS_NAME}${CLASS_NAME_SEPARATOR}${variant}`,
      styles: () =>
        sanitize(
          `${theme.variants?.[variant] ?? ""} ${VARIANT_CLASSES[variant]}-${parsedColors[defaultColor]}`
        )
    }))
  ];

  const shortcuts = () =>
    ([] as StyleHandler[]).concat(
      ...Object.entries(parsedColors).map(([name, color]) => toShortCutStyles(theme, name, color))
    );

  return {
    defaults,
    colors,
    sizes,
    shortcuts
  };
};

export const configHandler = <T extends ThemeOptions>(config: Config): ThemeHandler<T> => {
  const customConfig = config("components");
  const themeColors: ConfigProp = config("theme").colors;

  const getColorDefaults = (color: string, variants: ConfigProp) => {
    if (typeof variants === "string" || variants.DEFAULT) {
      return color;
    }

    return (variants["500"] && `${color}-500`) || `${color}-${Object.keys(variants).shift()}`;
  };

  const colorVariantsReducer = (color: string, variants: ConfigProp) =>
    typeof variants === "object"
      ? Object.keys(variants)
          .filter((key) => key !== "DEFAULT")
          .reduce(
            (reduced, key) => ({
              ...reduced,
              [`${color}-${key}`]: `${color}-${key}`
            }),
            {}
          )
      : {};

  const parsedColors: ParsedColors = Object.entries(themeColors || {}).reduce(
    (reduced, [key, value]) => ({
      ...reduced,
      [key]: getColorDefaults(key, value as ConfigProp),
      ...colorVariantsReducer(key, value as ConfigProp)
    }),
    {}
  );

  const isExtending = customConfig && !!customConfig["extends"];
  const themeConfig: ThemeConfig<T> = (isExtending && customConfig["extends"]) || customConfig;

  return (property: ThemeProperties<T>, defaultTheme: ThemeOptions) => {
    const theme = themeHandler(isExtending, defaultTheme, themeConfig && themeConfig[property]);
    return generateConfig(theme, parsedColors);
  };
};
