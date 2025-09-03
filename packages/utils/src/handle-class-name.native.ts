import { Variants } from "@/types";

export const nativeHandleClassName = (variant: Variants, className: string): string =>
  `icon-default ${
    (variant === "filled" && "icon-filled ") || (variant === "outlined" && "icon-outlined ") || ""
  }${className ?? ""}`.trim();
