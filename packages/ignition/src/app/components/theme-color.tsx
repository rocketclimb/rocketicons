"use client";
import useThemeHandler from "@/hooks/use-theme-handler";
import useTailwindTheme from "@/hooks/use-tailwind-theme";

const ThemeColor = () => {
  const { isDark } = useThemeHandler();
  const { colors } = useTailwindTheme();
  return (
    <>
      <meta name="theme-color" content={isDark ? colors["on-primary"] : colors.primary} />
      <meta
        name="msapplication-TileColor"
        content={isDark ? colors["on-primary"] : colors.primary}
      />
    </>
  );
};

export default ThemeColor;
