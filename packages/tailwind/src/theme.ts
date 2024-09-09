import { ThemeOptions } from "@/types";

const getDefaultTheme = (prefix: string = ""): ThemeOptions => ({
  default: `${prefix}sky-500-base`,
  baseStyle: `${prefix}p-0 ${prefix}inline-block`,
  variants: {
    filled: "",
    outlined: ""
  },
  sizes: {
    xs: `${prefix}h-2`,
    sm: `${prefix}h-4`,
    base: `${prefix}h-5 ${prefix}w-5`,
    lg: `${prefix}h-6 ${prefix}w-6`,
    xl: `${prefix}h-7 ${prefix}w-7`,
    "2xl": `${prefix}h-8 ${prefix}w-8`,
    "3xl": `${prefix}h-9 ${prefix}w-9`,
    "4xl": `${prefix}h-10 ${prefix}w-10`,
    "5xl": `${prefix}h-11 ${prefix}w-11`,
    "6xl": `${prefix}h-12 ${prefix}w-12`,
    "7xl": `${prefix}h-14 ${prefix}w-14`
  }
});

export default getDefaultTheme;
