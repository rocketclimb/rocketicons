import { serverEnv } from "@/env/server";
import { AvailableLanguages } from "@/app/types";

const baseUrl = serverEnv.NEXT_PUBLIC_APP_URL ?? "https://rocketicons.io";
const playgroundUrl = serverEnv.NEXT_PUBLIC_PLAYGROUND_URL ?? "https://playcode.io/1870276";
const env =
  (process.env.NEXT_PUBLIC_VERCEL_ENV as "production" | "preview" | "development" | "local") ||
  "local";

export const siteConfig = {
  name: "rocketicons",
  url: baseUrl,
  links: {
    twitter: "https://twitter.com/therocketclimb",
    github: "https://github.com/rocketclimb"
  },
  locales: AvailableLanguages,
  defaultLocale: "en",
  menuConfig: {
    componentGroups: ["getting-started"]
  },
  isLocal: env === "local",
  env,
  playgroundUrl
};

export type SiteConfig = typeof siteConfig;
