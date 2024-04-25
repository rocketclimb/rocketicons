import definitions from "./sizes.json";
export const sizesUtilities = ["size-5", "size-10", "size-14", "size-16"];

export const hwUtilities = ["h-2 w-2", "h-4 w-4", "h-7 w-7", "h-9 w-9"];

export const otherSizes = [...sizesUtilities, ...hwUtilities];

export const sizes = definitions;
