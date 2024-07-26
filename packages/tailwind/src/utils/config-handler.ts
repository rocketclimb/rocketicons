import {
  Config,
  ThemeOptions,
  ThemeHandler,
  ThemeProperties,
  Defaults,
  StyleHandler,
  ConfigProp,
  ParsedColors
} from "@/types";
import { configResolver, sanitize } from "@rocketclimb/tw-utils";

const AVAILABLE_VARIANTS = ["outlined", "filled"] as const;
type Variant = (typeof AVAILABLE_VARIANTS)[number];

const VARIANT_CLASSES: Record<Variant, "stroke" | "fill"> = {
  outlined: "stroke",
  filled: "fill"
};

export const ROOT_CLASS_NAME = "ri";
export const DEFAULT_CLASS_NAME = "default";
export const CLASS_NAME_SEPARATOR = ".";

const toColorsStyles = (parsedColors: ParsedColors, variant: Variant, prefix?: string) =>
  ([] as StyleHandler[]).concat(
    ...Object.entries(parsedColors).map(([name, color]) => ({
      name: () => `${name}${CLASS_NAME_SEPARATOR}${variant}`,
      styles: () => `${prefix}${VARIANT_CLASSES[variant]}-${color}`
    }))
  );

const toShortCutStyles = (theme: ThemeOptions, name: string, color: string, prefix?: string) =>
  ([] as StyleHandler[]).concat(
    ...Object.keys(theme.sizes).map((size) =>
      ([] as StyleHandler[]).concat([
        {
          name: () => `${name}-${size}`,
          styles: () => sanitize(theme.sizes[size])
        },
        ...AVAILABLE_VARIANTS.map((variant) => ({
          name: () => `${name}-${size}${CLASS_NAME_SEPARATOR}${variant}`,
          styles: () => `${prefix}${VARIANT_CLASSES[variant]}-${color}`
        }))
      ])
    )
  );

const generateConfig = <T extends ThemeOptions>(
  theme: T,
  parsedColors: ParsedColors,
  prefix?: string
) => {
  const prefixToAdd = prefix ? prefix : "";

  const getDefaults = (): Defaults => {
    const pieces = theme.default!.split("-");
    const defaultSize = pieces.pop()!;
    return { defaultColor: pieces.join("-"), defaultSize };
  };

  const { defaultColor, defaultSize } = getDefaults();

  const colors = () =>
    ([] as StyleHandler[]).concat(
      ...AVAILABLE_VARIANTS.map((variant) => toColorsStyles(parsedColors, variant, prefixToAdd))
    );

  const sizes = () =>
    ([] as StyleHandler[]).concat(
      ([] as StyleHandler[]).concat(
        ...Object.keys(theme.sizes).map((size) => ({
          name: () => `${size}`,
          styles: () => `${sanitize(theme.sizes[size])}`
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
          `${theme.variants?.[variant] ?? ""} ${prefixToAdd}${VARIANT_CLASSES[variant]}-${parsedColors[defaultColor]}`
        )
    }))
  ];

  const shortcuts = () =>
    ([] as StyleHandler[]).concat(
      ...Object.entries(parsedColors).map(([name, color]) =>
        toShortCutStyles(theme, name, color, prefixToAdd)
      )
    );

  return {
    defaults,
    colors,
    sizes,
    shortcuts
  };
};

export const configHandler = <T extends ThemeOptions>(
  config: Config,
  prefix?: string
): ThemeHandler<T> => {
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

  return (property: ThemeProperties<T>, defaultTheme: ThemeOptions) => {
    const theme = configResolver<ThemeOptions>(property, config, {
      rootPath: "components",
      defaultConfig: defaultTheme
    });
    return generateConfig(theme, parsedColors, prefix);
  };
};
