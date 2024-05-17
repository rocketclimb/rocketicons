"use client";
import { PropsWithChildren } from "react";

import useThemeHandler from "@/hooks/use-theme-handler";

const ThemeControl = ({ children }: PropsWithChildren) => {
  const { isLoaded, isDark } = useThemeHandler();

  return (
    <div
      className={`group/theme-selector theme-selector transition duration-1000 ${
        (isLoaded && "opacity-100") || "opacity-0"
      } ${(isDark && "dark") || ""}`}
    >
      {children}
    </div>
  );
};

export default ThemeControl;
