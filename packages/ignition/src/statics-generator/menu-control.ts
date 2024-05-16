import { docIndex } from "content-collections";
import { AvailableLanguages } from "@/types";
import { siteConfig } from "@/config/site";
import { Docs, MainComponent, Components } from "@/locales/types";
import { getManifest, templateBuilder, write } from "./utils";

const { componentGroups } = siteConfig.menuConfig;

const OTHER_PAGES = ["icons", "roadmap"];

const OUTPUT_FILE = "tailwind/menu-control.ts";

const Template = `
/*
 * THIS FILE IS AUTO GENERATED
 * forcing to create menu control classes
 * 
{0}
 *
 */
`;

const generateClassMatcher = (url: string) => ` * current-url-[${url}]`;
const generateExactClassMatcher = (url: string) => ` * current-url-is-[${url}]`;

const componetsMapper = (language: string, parent: string, components: Components): string => {
  const links: string[] = [generateExactClassMatcher(`/${language}/docs/${parent}`)];
  links.push(
    ...Object.values(components).map(({ slug }) =>
      generateClassMatcher(`/${language}/docs/${parent}#${slug}`)
    )
  );
  return links.join("\n");
};

const mapper =
  (enSlug: string) =>
  ([language, { slug, components }]: [string, MainComponent]): string =>
    componentGroups.includes(enSlug)
      ? componetsMapper(language, slug, components)
      : generateClassMatcher(`/${language}/docs/${slug}`);

const generator = async () => {
  const classes: string[] = AvailableLanguages.map((language) =>
    OTHER_PAGES.map((page) => generateExactClassMatcher(`/${language}/${page}`)).join(`\n`)
  );
  const docs = Object.entries(docIndex["docs"] as Docs);
  docs.forEach(([enSlug, doc]) => classes.push(...Object.entries(doc).map(mapper(enSlug))));

  classes.push(
    ...([] as string[]).concat(
      ...getManifest().map(({ id }) =>
        AvailableLanguages.map((language) => generateClassMatcher(`/${language}/icons/${id}`))
      )
    )
  );

  await write(OUTPUT_FILE, templateBuilder(Template, classes.join("\n")));
};

generator();
