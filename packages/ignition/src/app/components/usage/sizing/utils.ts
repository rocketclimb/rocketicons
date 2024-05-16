import definitions from "./sizes.json";
export const sizesUtilities = ["size-5", "size-10", "size-14", "size-16"];

export const hwUtilities = ["h-5 w-5", "h-6 w-6", "h-7 w-7", "h-9 w-9"];

export const otherSizes = [...sizesUtilities, ...hwUtilities];

export const sizes = definitions;
