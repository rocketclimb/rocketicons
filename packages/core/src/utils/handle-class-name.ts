import { Variants } from "@/types";

export const handleClassName = (variant: Variants, className: string): string =>
  `${
    (variant === "filled" && "icon-filled") ||
    (variant === "outlined" && "icon-outlined") ||
    ""
  } ${(!className?.match(/icon\-/) && `icon-default`) || ""} ${className}`;
