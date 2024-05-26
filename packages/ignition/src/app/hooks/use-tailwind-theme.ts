import { useMemo } from "react";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/tailwind-conf";

type CustomColors = {
  primary: string;
  "primary-variant": string;
  "on-primary": string;
  "on-primary-variant": string;
};

const useTailwindTheme = () => {
  const { theme } = useMemo(() => resolveConfig(tailwindConfig), [tailwindConfig]);
  return theme as typeof theme & { colors: DefaultColors & CustomColors };
};

export default useTailwindTheme;
