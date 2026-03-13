import { Variants } from "@/types";

export const handleClassName = (variant: Variants, className: string): string =>
  `icon-ri icon-default
    ${(["filled", "full"].includes(variant) && "icon-filled") || ""}
    ${(["outlined", "full"].includes(variant) && "icon-outlined") || ""}
    ${className}`
    .trim()
    .replace(/\s{2,}/g, " ");
