"use client";
import { PropsWithChildren, useEffect } from "react";

import useThemeHandler from "@/hooks/use-theme-handler";

const ThemeControl = ({ children }: PropsWithChildren) => {
  const { isLoaded, isDark } = useThemeHandler();

  // Sync .dark class on <html> for Tailwind v4 dark: variant
  // The inline <head> script sets the initial value before hydration;
  // this effect keeps it in sync when the user toggles themes.
  useEffect(() => {
    if (!isLoaded) return;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isLoaded, isDark]);

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
