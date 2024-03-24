import { Variants } from "@/types";

type PropMap = {
  properies: string[];
  blacklist: string[];
};

const variantsPropertyMap: Record<Variants, PropMap> = {
  filled: {
    properies: ["fill"],
    blacklist: ["stroke"],
  },
  outlined: {
    properies: ["stroke"],
    blacklist: ["fill"],
  },
  full: {
    properies: ["fill", "stroke"],
    blacklist: [],
  },
};

export const styleToString = (
  variant: Variants,
  { color, ...styles }: Record<string, string>
): string => {
  const { properies } = variantsPropertyMap[variant];

  properies.forEach((property) => {
    styles[property] = color || styles[property];
  });

  return `{ ${Object.entries(styles)
    .filter(([key]) => !variantsPropertyMap[variant].blacklist.includes(key))
    .map(([key, value]) => `${key}:${value};`)
    .join("")} }`;
};
