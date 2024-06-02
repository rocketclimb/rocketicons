import { useMemo } from "react";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/tailwind-conf";

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

const useTailwindTheme = () => {
  const { theme } = useMemo(() => resolveConfig(tailwindConfig), [tailwindConfig]);
  return theme as typeof theme & { colors: DefaultColors & CustomColors };
};

export default useTailwindTheme;
