import { serverEnv } from "@/env/server";
import { useLocale } from "@/app/locales";

const { nav } = useLocale("en").config();

const baseUrl = serverEnv.NEXT_PUBLIC_APP_URL || "https://rocketicons.io";

export const siteConfig = {
  name: "rocketicons",
  url: baseUrl,
  ogImage: `${baseUrl}/opengraph-image`,
  description: "Icons your way and as you need them. On the Web or Mobile.",
  links: {
    twitter: "https://twitter.com/rocketclimb",
    github: "https://github.com/rocketclimb/",
  },
  locales: ["en", "pt-br"],
  menuConfig: {
    componentGroups: ["getting-started"],
  },
};

// console.log(siteConfig);

export type SiteConfig = typeof siteConfig;
