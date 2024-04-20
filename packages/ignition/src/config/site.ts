import { serverEnv } from "@/env/server";

const baseUrl = serverEnv.NEXT_PUBLIC_APP_URL || "https://rocketicons.io";

export const siteConfig = {
  name: "rocketicons",
  url: baseUrl,
  links: {
    twitter: "https://twitter.com/therocketclimb",
    github: "https://github.com/rocketclimb",
  },
  locales: ["en", "pt-br"],
  defaultLocale: "en",
  menuConfig: {
    componentGroups: ["getting-started"],
  },
};

export type SiteConfig = typeof siteConfig;
