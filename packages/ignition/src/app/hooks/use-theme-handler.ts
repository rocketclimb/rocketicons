import { useEffect, useState } from "react";
import useStorage from "@/hooks/use-storage";

export type ThemeOptions = "dark" | "light" | "system";

const useThemeHandler = (): {
  isLoaded: boolean;
  isDark: boolean | undefined;
  userPref: ThemeOptions | undefined;
  setPref: (option: ThemeOptions) => void;
} => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDarkOnSystem, setIsDarkOnSystem] = useState<boolean>();
  const [themePrefs, setThemePrefs] = useStorage<ThemeOptions>(
    "theme-prefs",
    "dark",
    true
  );

  const systemListener = (e: MediaQueryListEvent) =>
    setIsDarkOnSystem(e.matches);

  const init = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkOnSystem(query.matches);
    query.addEventListener("change", systemListener);
    return () => query.removeEventListener("change", systemListener);
  }, []);

  useEffect(() => {
    themePrefs && init();
  }, [themePrefs]);

  return {
    isLoaded,
    isDark:
      (isLoaded &&
        (themePrefs === "dark" ||
          (themePrefs === "system" && isDarkOnSystem))) ||
      undefined,
    userPref: themePrefs,
    setPref: (option: ThemeOptions) => setThemePrefs(option),
  };
};

export default useThemeHandler;
