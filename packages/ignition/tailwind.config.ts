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
      },
    },
  },
  plugins: [
    icons,
    plugin(({ addComponents }) => {
      addComponents({
        ".active-content": {
          "@apply border-sky-500 dark:border-sky-500": {},
        },
        ".active-content span": {
          "@apply text-sky-500 dark:text-sky-500": {},
        },
      });
    }),
  ],
};
export default config;
