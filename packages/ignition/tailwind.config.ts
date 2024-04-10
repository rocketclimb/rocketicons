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
    plugin(({ addComponents, addVariant }) => {
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
      }),
        addVariant("highlight", "h1 + &");
    }),
  ],
  safelist: [
    {
      pattern: /icon-*/,
    },
    "bg-black",
    "list-disc",
    "list-decimal",
    "list-inside",
  ],
  components: {
    icon: {
      default: "sky-500-base",
      baseStyle: "p-0 inline-block",
      variants: {
        filled: "",
        outlined: "",
      },
      sizes: {
        xs: "size-2",
        sm: "size-4",
        base: "size-5",
        lg: "size-6",
        xl: "size-7",
        "2xl": "size-8",
        "3xl": "size-9",
        "4xl": "size-10",
        "5xl": "size-11",
        "6xl": "size-12",
        "7xl": "size-14",
      },
    },
  },
};
export default config;

// color não extende em icons, só em theme (tailwind)
