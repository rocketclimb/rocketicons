import { serverEnv } from "@/env/server";

const siteUrl = serverEnv.NEXT_PUBLIC_APP_URL || "https://rocketicons.io";

export const siteConfig = {
  name: "rocketicons",
  url: siteUrl,
  ogImage: `${siteUrl}/opengraph-image`,
  description: "Icons your way and as you need them. On the Web or Mobile.",
  links: {
    twitter: "https://twitter.com/rocketclimb",
    github: "https://github.com/rocketclimb/",
  },
};

export type SiteConfig = typeof siteConfig;
