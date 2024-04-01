"use client";
import { PropsWithChildren, createContext, useContext } from "react";

import useThemeHandler, { ThemeOptions } from "@/hooks/use-theme-handler";

type SetTheme = (theme: ThemeOptions) => void;

const Context = createContext<[ThemeOptions | undefined, SetTheme]>([
  undefined,
  () => {},
]);

export const useThemeContext = () => useContext(Context);

const ThemeContext = ({ children }: PropsWithChildren) => {
  const { isLoaded, isDark, userPref, setPref } = useThemeHandler();

  return (
    <Context.Provider value={[userPref, setPref]}>
      <div
        className={`theme-selector transition duration-1000 ${
          (isLoaded && "opacity-100") || "opacity-0"
        } ${(isDark && "dark") || ""}`}
      >
        {children}
      </div>
    </Context.Provider>
  );
};

export default ThemeContext;
