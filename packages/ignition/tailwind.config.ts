import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import icons from "rocketicons/tailwind";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-dark": "url('/img/hero-dark.jpg')",
        "hero-light": "url('/img/hero-light.jpg')",
        grid: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      },
      fontFamily: {
        quicksand: ["var(--font-quicksand)"],
        monospace: ["var(--font-monospace)"],
      },
      keyframes: {
        "delayed-appearing": {
          "0%, 60%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "delayed-hidden": {
          "0%, 40%": { visibility: "visible" },
          "100%": { visibility: "hidden" },
        },
      },
      animation: {
        "delayed-appearing": "delayed-appearing 300ms ease-in-out forwards",
        "delayed-hidden": "delayed-hidden 300ms ease-in-out forwards",
      },
    },
  },
  plugins: [
    icons,
    plugin(({ addComponents, addVariant, matchUtilities }) => {
      addComponents({
        ".active-content": {
          "@apply border-sky-500 dark:border-sky-500": {},
        },
        ".active-content span": {
          "@apply text-sky-500 dark:text-sky-500": {},
        },
        ".dark-scrollbar::-webkit-scrollbar-thumb": {
          background: "var(--dark-scrollbar-track-thumb)",
        },
        ".dark-scrollbar::-webkit-scrollbar-track": {
          background: "var(--dark-scrollbar-track-bg)",
        },
        ".default-text-color": {
          "@apply text-slate-900 dark:text-slate-200": {},
        },
        ".sub-title": {
          "@apply whitespace-pre-wrap font-semibold": {},
        },
        ".sub-section": {
          "@apply mb-4 lg:-ml-2 lg:pl-2 default-text-color": {},
        },
      });
      addVariant("highlight", "h1 + &");
      addVariant("prose", ".prose &");
      addVariant("thin", ".thin &");
      matchUtilities({
        deep: (value) => {
          type Style = string | Record<string, string>;
          const styles: Record<
            string,
            Style | Record<string, Style | Record<string, Style>>
          > = {
            counterReset: "list-number",
            "& .count": {
              display: "flex",
              "&::before": {
                "@apply w-0 overflow-hidden -ml-5 md:ml-0 md:w-7 md:pl-2 md:mr-2 grow-0 shrink-0 font-monospace text-sm leading-6 whitespace-normal text-slate-600 text-right select-none h-full":
                  {},
                counterIncrement: "list-number",
                content: "counter(list-number)",
              },
            },
          };
          const deep = parseInt(value);
          for (let i = 1; i <= deep; i++) {
            styles[`${".deep ".repeat(i)} .count::before`] = {
              marginRight: `${i * 20}px !important`,
            };
          }
          return {
            "& .with-lines": styles,
          };
        },
      });
    }),
  ],
  safelist: [
    {
      pattern: /icon-*/,
    },
  ],
};

export default config;
