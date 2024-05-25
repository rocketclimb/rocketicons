import type { Config } from "tailwindcss";
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
          "@apply border-sky-500 dark:border-sky-500": {}
        },
        ".active-content span": {
          "@apply text-sky-500 dark:text-sky-500": {}
        },
        ".default-text-color": {
          "@apply text-slate-900 dark:text-slate-200": {}
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
            "@apply border-sky-500 dark:border-sky-500 text-sky-500 dark:text-sky-500": {}
          }
        })
      });
      matchUtilities({
        "current-url-is": (value) => ({
          [`nav[data-current="${value}"] &`]: {
            "@apply border-sky-500 dark:border-sky-500 text-sky-500 dark:text-sky-500": {}
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
