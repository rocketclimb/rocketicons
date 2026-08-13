import { AvailableLanguages } from "@/app/types";

const playgroundUrl = process.env.NEXT_PUBLIC_PLAYGROUND_URL ?? "https://playcode.io/1870276";

export const siteConfig = {
  name: "rocketicons",
  companyName: "rocketclimb",
  companyDescription: "Creating tools to skyrocket your projects",
  companyFounders: ["Daniel Gomes", "Jeferson Amorim"],
  companyUrl: "https://rocketclimb.com",
  companyEmail: "contact@rocketclimb.io",
  links: {
    twitter: "https://twitter.com/therocketclimb",
    github: "https://github.com/rocketclimb"
  },
  locales: AvailableLanguages,
  defaultLocale: "en",
  isLocal: process.env.NODE_ENV !== "production",
  menuConfig: {
    componentGroups: ["getting-started"]
  },
  playgroundUrl
};

export type SiteConfig = typeof siteConfig;
