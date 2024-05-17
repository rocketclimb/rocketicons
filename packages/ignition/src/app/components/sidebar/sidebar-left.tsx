import "@/utils";

import Link from "next/link";
import { PropsWithChildren } from "react";
import { Languages, PropsWithLang } from "@/types";
import { IconsManifest } from "@/data-helpers/icons/manifest";
import RocketIconsText from "@/components/rocketicons-text";
import { siteConfig } from "@/config/site";
import { MainComponent, Slug, Component, ComponentsAsList, DocsAsList } from "@/locales/types";
import { withLocale } from "@/locales/with-locale";
import SearchButton from "@/components/search/search";
import Nav from "./nav";
import Playground from "./playground";

const { componentGroups } = siteConfig.menuConfig;

type MenuBlockProps = {
  text: string;
  href: string;
  exactMatch?: boolean;
};

const MenuBlock = ({ children, href, text, exactMatch }: PropsWithChildren & MenuBlockProps) => (
  <li className="mt-10 lg:mt-8">
    <h5
      className={`current-url-${exactMatch ? "is-" : ""}[${href}]
        mb-5 pl-1.5 lg:mb-3 block border-l border-transparent hover:border-slate-400 font-semibol
        text-slate-900 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-300 dark:hover:border-slate-500
      `}
    >
      <Link href={href}>
        <span>{text}</span>
      </Link>
    </h5>

    {children}
  </li>
);

const SubMenu = ({ children }: PropsWithChildren) => (
  <ul className="space-y-4 lg:space-y-2 border-l border-slate-100 dark:border-slate-800">
    {children}
  </ul>
);

const MenuItem = ({
  href,
  children
}: PropsWithChildren & {
  href: string;
}) => (
  <Link
    className={`block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 current-url-[${href}]`}
    href={href}
  >
    {children}
  </Link>
);

const SubMenuItems = ({
  lang,
  components,
  mainDoc,
  mainDocEnSlug
}: PropsWithLang & {
  components: ComponentsAsList;
  mainDoc: MainComponent;
  mainDocEnSlug: Slug;
}) =>
  components?.map((model) => {
    const isComponent = !Array.isArray(model);
    const subMenu = isComponent ? model : model[1][lang];

    return (
      (componentGroups.includes(mainDocEnSlug) || !isComponent) && (
        <li key={`menu-${subMenu.slug}`}>
          <MenuItem
            href={
              isComponent
                ? `/${lang}/docs/${mainDoc.slug}#${subMenu.slug}`
                : `/${lang}/docs/${subMenu.slug}`
            }
          >
            <span>{subMenu.title}</span>
          </MenuItem>
        </li>
      )
    );
  });

const IconList = ({ lang }: PropsWithLang) => (
  <>
    {IconsManifest.map(({ id, name }) => (
      <li key={`${id}-${name}`}>
        <MenuItem href={`/${lang}/icons/${id}`}>
          {(name === "rocketclimb" && <RocketIconsText className="hover:text-sky-500" />) || name}
        </MenuItem>
      </li>
    ))}
  </>
);

const DocList = ({ lang }: PropsWithLang) => {
  const { docs: getDocs } = withLocale(lang);
  const docs = Object.entries(getDocs() || {});
  const mainMenus = docs.filter(([slug, doc]) => doc[lang].group === slug);

  return (
    <>
      {mainMenus.map(([mainDocEnSlug, doc]) => {
        const mainDoc = doc[lang];
        const componentsProp = Object.values(mainDoc.components);
        const hasComponents = componentsProp.length > 0;

        const components = hasComponents
          ? toSorted(componentsProp)
          : docs.filter(filterComponentsByGroup(lang, mainDocEnSlug));

        return (
          mainDoc && (
            <MenuBlock
              key={`menublock-${mainDoc.slug}`}
              text={mainDoc.title}
              href={`/${lang}/docs/${mainDoc.slug}`}
              exactMatch={componentGroups.includes(mainDoc.enslug)}
            >
              <SubMenu>
                <SubMenuItems
                  lang={lang}
                  components={components}
                  mainDoc={mainDoc}
                  mainDocEnSlug={mainDocEnSlug}
                />
              </SubMenu>
            </MenuBlock>
          )
        );
      })}
    </>
  );
};

export const SidebarLeft = ({ lang }: PropsWithLang) => (
  <Nav>
    <ul className={`hidden relative lg:w-56 lg:block group-data-[open=true]:block`}>
      <div className="mt-3">
        <SearchButton lang={lang} />
      </div>
      <Playground />
      <DocList lang={lang} />
      <MenuBlock text="Icons" href={`/${lang}/icons`} exactMatch>
        <SubMenu>
          <IconList lang={lang} />
        </SubMenu>
      </MenuBlock>
      <MenuBlock text="Roadmap" href={`/${lang}/roadmap`} exactMatch />
    </ul>
  </Nav>
);

const toSorted = (sorting: Component[]) =>
  sorting.sort(({ order: a }: Component, { order: b }: Component) => a - b);

const filterComponentsByGroup =
  (
    lang: Languages,
    enSlug: string
  ): ((value: DocsAsList, index: number, array: DocsAsList[]) => boolean) =>
  ([, doc]) =>
    doc[lang].group === enSlug && doc[lang].group != doc[lang].enslug;
