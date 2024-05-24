import { Languages } from "@/types";
import { siteConfig } from "@/config/site";
const { defaultLocale, locales } = siteConfig;

const getLocaleFromHeaders = (headers: Headers): Languages =>
  (
    headers
      .get("accept-language")
      ?.split(",")
      .map((language) => language.split(";").shift())
      .find(
        (language) => language && locales.includes(language.toLocaleLowerCase() as Languages)
      ) || defaultLocale
  ).toLowerCase() as Languages;

export default getLocaleFromHeaders;
