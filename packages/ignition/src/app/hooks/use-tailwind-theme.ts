"use client";

/**
 * Resolves TW v4 theme colors from CSS custom properties.
 * Replaces the TW v3 `resolveConfig()` approach which was removed in v4.
 */

type CustomColors = {
  primary: string;
  "primary-bright": string;
  "primary-lighter": string;
  "primary-light": string;
  "primary-medium": string;
  "primary-dark": string;
  "on-primary": string;
  surface: string;
  "surface-border": string;
  "surface-border-light": string;
  "surface-medium": string;
  "surface-border-medium": string;
  "surface-dark": string;
  "on-surface": string;
  "on-surface-dark": string;
  secondary: string;
  "secondary-light": string;
  "secondary-medium": string;
  "secondary-dark": string;
  background: string;
  "background-dark": string;
};

const COLOR_KEYS: (keyof CustomColors)[] = [
  "primary",
  "primary-bright",
  "primary-lighter",
  "primary-light",
  "primary-medium",
  "primary-dark",
  "on-primary",
  "surface",
  "surface-border",
  "surface-border-light",
  "surface-medium",
  "surface-border-medium",
  "surface-dark",
  "on-surface",
  "on-surface-dark",
  "secondary",
  "secondary-light",
  "secondary-medium",
  "secondary-dark",
  "background",
  "background-dark"
];

const useTailwindTheme = () => {
  const colors = COLOR_KEYS.reduce((acc, key) => {
    if (typeof window !== "undefined") {
      acc[key] =
        getComputedStyle(document.documentElement).getPropertyValue(`--color-${key}`).trim() ||
        "";
    } else {
      acc[key] = "";
    }
    return acc;
  }, {} as CustomColors);

  return { colors };
};

export default useTailwindTheme;
