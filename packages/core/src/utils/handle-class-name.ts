import { Variants } from "@/types";

export const handleClassName = (variant: Variants, className: string): string =>
  `${
    (variant === "filled" && "icon-filled ") || (variant === "outlined" && "icon-outlined ") || ""
  }${((!className || !/icon-/.exec(className)) && "icon-default ") || ""}${className}`.trim();
