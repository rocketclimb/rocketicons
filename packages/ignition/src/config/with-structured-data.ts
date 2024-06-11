import { SoftwareApplication, Offer, Organization } from "@/app/structured-data";
import { Languages } from "@/app/types";
import { siteConfig } from ".";
import { withLocale } from "@/app/locales";
import { serverEnv } from "@/env/server";

export type StructuredData = {
  organization: Organization;
  software: SoftwareApplication;
};

export const withStructuredData = (lang: Languages): StructuredData => {
  const { component } = withLocale(lang);
  const { description } = component("home");

  const organizationJsonLd = new Organization(siteConfig.companyName)
    .setDescription(siteConfig.companyDescription)
    .setUrl(siteConfig.companyUrl)
    .setSameAs([siteConfig.links.twitter, siteConfig.links.github])
    .setEmail(siteConfig.companyEmail)
    .setFounders(siteConfig.companyFounders)
    .setLogo(`${serverEnv.NEXT_PUBLIC_APP_URL}/img/rocketclimb-logo.png`);

  const softwareApplicationJsonLd = new SoftwareApplication(siteConfig.name, description)
    .setApplicationCategory(["DeveloperApplication", "UtilitiesApplication"])
    .setAuthor(organizationJsonLd)
    .setOffers(new Offer(0));

  return {
    organization: organizationJsonLd,
    software: softwareApplicationJsonLd
  };
};
