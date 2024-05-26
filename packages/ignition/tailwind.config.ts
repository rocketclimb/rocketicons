import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";
import icons from "rocketicons/tailwind";
import { plugin as codeBlock } from "@rocketclimb/code-block/tailwind";

const config: Config = {
  darkMode: "class",
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-dark": "url('/img/hero-dark.jpg')",
        "hero-light": "url('/img/hero-light.jpg')",
        grid: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")"
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
        quicksand: ["var(--font-quicksand)"],
        monospace: ["var(--font-monospace)"],
        icons: ["Material Symbols Outlined"]
      },
      colors: {
        background: colors.white,
        "background-dark": colors.slate[900],
        primary: colors.slate[900],
        "primary-bright": colors.slate[300],
        "primary-lighter": colors.slate[400],
        "primary-light": colors.slate[500],
        "primary-medium": colors.slate[600],
        "primary-dark": colors.slate[200],
        "primary-darken": colors.slate[700],
        "on-primary": colors.white,
        surface: colors.white,
        "surface-lighter": colors.slate[50],
        "surface-border": colors.slate[200],
        "surface-border-lighter": colors.slate[400],
        "surface-light": colors.slate[600],
        "surface-border-light": colors.gray[200],
        "surface-medium": colors.slate[700],
        "surface-border-medium": colors.sky[900],
        "surface-dark": colors.slate[800],
        "surface-border-dark": colors.slate[900],
        "on-surface": colors.slate[700],
        "on-surface-dark": colors.slate[400],
        secondary: colors.sky[500],
        "secondary-lighter": colors.sky[400],
        "secondary-light": colors.sky[800],
        "secondary-medium": colors.sky[900],
        "secondary-dark": colors.sky[950],
        "on-secondary-lighter": colors.sky[600]
      },
      screens: {
        xs: "375px"
      },
      keyframes: {
        "delayed-appearing": {
          "0%, 60%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "delayed-hidden": {
          "0%, 40%": { visibility: "visible" },
          "100%": { visibility: "hidden" }
        }
      },
      animation: {
        "delayed-appearing": "delayed-appearing 300ms ease-in-out forwards",
        "delayed-hidden": "delayed-hidden 300ms ease-in-out forwards"
      }
    }
  },
  plugins: [
    icons,
    codeBlock,
    plugin(({ addComponents, addVariant, matchUtilities }) => {
      addComponents({
        ".hero h1": {
          "@apply text-slate-900 font-extrabold text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-center dark:text-white":
            {}
        },
        ".active-content": {
          "@apply border-sky-500": {}
        },
        ".active-content span": {
          "@apply text-sky-500": {}
        },
        ".default-text-color": {
          "@apply text-primary dark:text-primary-dark": {}
        },
        ".sub-title": {
          "@apply whitespace-pre-wrap font-semibold": {},
          "p + &": {
            "@apply mt-2": {}
          }
        },
        ".sub-section": {
          "@apply mb-4 lg:-ml-2 lg:pl-2 default-text-color": {}
        },
        ".collapse-table": {
          "&[data-collapse=true]": {
            "& > div:first-child": {
              "@apply lg:overflow-hidden": {}
            },
            "&:hover > div:first-child": {
              "@apply lg:overflow-auto": {}
            },
            "&:not(:has(:checked))": {
              "& > div:first-child": {
                "@apply h-96 max-lg:overflow-hidden": {}
              },
              "& .showing-fewer": {
                "@apply hidden": {}
              },
              "& .showing-all": {
                "@apply inline": {}
              }
            },
            "&:has(:checked)": {
              "& .showing-fewer": {
                "@apply inline": {}
              },
              "& .showing-all": {
                "@apply hidden": {}
              }
            }
          }
        },
        "[data-section]": {
          code: {
            "@apply lg:text-[.9rem]/normal": {}
          }
        },
        ".dark-mask-image": {
          "mask-image": "linear-gradient(transparent, black)"
        },
        ".light-mask-image": {
          "mask-image": "linear-gradient(to bottom, transparent, black)"
        }
      });
      addVariant("highlight", "h1 + &");
      addVariant("section", "[data-section] &");
      addVariant("tab-section", "[data-section] section &");
      addVariant("prose", ".prose &");
      addVariant("blockquote", "blockquote &");
      addVariant("quote", ".quote &");
      addVariant("thin", ".thin &");
      addVariant("docked", "nav &");
      addVariant("landingpage", ".landingpage ~ .theme-selector &");
      addVariant("content", ".content ~ .theme-selector &");
      addVariant("hero", ".hero &");
      addVariant("icons-hero", ".icons-hero &");
      addVariant("icon-title-box", ".icon-title-box &");
      addVariant("icon-info-area", ".icon-info-area &");
      addVariant("after-p", "p ~ &");
      matchUtilities({
        "current-url": (value) => ({
          [`nav[data-current^="${value}"] &`]: {
            "@apply border-sky-500 text-sky-500": {}
          }
        })
      });
      matchUtilities({
        "current-url-is": (value) => ({
          [`nav[data-current="${value}"] &`]: {
            "@apply border-sky-500 text-sky-500": {}
          }
        })
      });
    })
  ],
  safelist: [
    {
      pattern: /icon-*/
    }
  ],
  blocklist: ["current-url-[${href}]"]
};

export default config;
