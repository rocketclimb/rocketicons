import "@/utils";

import Link from "next/link";
import { PropsWithChildren } from "react";
import { PropsWithClassName, PropsWithLang } from "@/types";
import { IconsManifest } from "@/data-helpers/icons/manifest";
import RocketIconsText from "@/components/rocketicons-text";
import { siteConfig } from "@/config/site";
import { withLocale } from "@/locales/with-locale";
import SearchButton from "@/app/components/search/search";

const selectedClassName = (slug: string) => `group-has-[.docs-${slug}]:active-content`;

const TextMenuTitle = ({
  text,
  href,
  className
}: {
  text: string;
  href: string;
} & PropsWithClassName) => (
  <MenuTitle href={href} className={className}>
    <span className={className}>{text}</span>
  </MenuTitle>
);

const MenuTitle = ({
  href,
  className,
  children
}: PropsWithChildren & {
  href: string;
} & PropsWithClassName) => (
  <h5
    className={`mb-8 pl-1 lg:mb-3 block border-l border-transparent hover:border-slate-400 font-semibold text-slate-900 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-300 dark:hover:border-slate-500 ${
      className || ""
    }`}
  >
    <Link href={href}>{children}</Link>
  </h5>
);

const MenuBlock = ({ children }: PropsWithChildren) => (
  <li className="mt-12 lg:mt-8">{children}</li>
);

const SubMenu = ({ children }: PropsWithChildren) => (
  <ul className="space-y-6 lg:space-y-2 border-l border-slate-100 dark:border-slate-800">
    {children}
  </ul>
);

const MenuItem = ({
  href,
  className,
  children
}: PropsWithChildren & {
  href: string;
  className: string;
}) => (
  <Link
    className={`block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 ${
      className || ""
    }`}
    href={href}
  >
    {children}
  </Link>
);

export const SidebarLeft = ({ lang }: PropsWithLang) => {
  const DocList = () => {
    const { docs: getDocs } = withLocale(lang);
    const docs = Object.entries(getDocs() || {});
    const mainMenus = docs.filter((doc: any) => doc[1][lang].group === doc[0]);

    const renderDocList = () => {
      return (
        <>
          <div className="mt-3">
            <SearchButton lang={lang} />
          </div>
          {mainMenus.map((doc: any, i: number) => {
            const mainDocEnSlug = doc[0];
            const mainDoc = doc[1][lang];
            const componentsProp = Object.values(mainDoc.components);
            const hasComponents = componentsProp.length > 0;
            const sortedComponents = componentsProp.sort((a: any, b: any) => a.order - b.order);
            const componentsByGroup = docs.filter(
              (doc: any) =>
                doc[1][lang].group === mainDocEnSlug && doc[1][lang].group != doc[1][lang].enslug
            );

            const components = hasComponents ? sortedComponents : componentsByGroup;

            return (
              mainDoc && (
                <MenuBlock key={i}>
                  <TextMenuTitle
                    key={i}
                    text={mainDoc.title}
                    href={`/${lang}/docs/${mainDoc.slug}`}
                    className={selectedClassName(mainDoc.slug)}
                  />

                  <SubMenu>
                    {components &&
                      components.map((model: any, i: number) => {
                        const isComponent = mainDoc.components.hasOwnProperty(model.enslug);

                        const subMenu = isComponent ? model : model[1][lang];

                        return (
                          (siteConfig.menuConfig.componentGroups.indexOf(mainDocEnSlug) > -1 ||
                            !isComponent) && (
                            <li key={i}>
                              <MenuItem
                                href={
                                  isComponent
                                    ? `/${lang}/docs/${mainDoc.slug}#${subMenu.slug}`
                                    : `/${lang}/docs/${subMenu.slug}`
                                }
                                className={subMenu.activeSelector}
                              >
                                <span className={subMenu.activeSelector}>{subMenu.title}</span>
                              </MenuItem>
                            </li>
                          )
                        );
                      })}
                  </SubMenu>
                </MenuBlock>
              )
            );
          })}
        </>
      );
    };

    return renderDocList();
  };

  const IconList = () => (
    <>
      {IconsManifest.map(({ id, name }: { id: string; name: string }, i: number) => (
        <li key={i}>
          <MenuItem href={`/${lang}/icons/${id}`} className={selectedClassName(id)}>
            {(name === "rocketclimb" && (
              <RocketIconsText className="text-gray-950 hover:text-sky-500 dark:text-neutral-100 dark:hover:text-sky-500" />
            )) ||
              name}
          </MenuItem>
        </li>
      ))}
    </>
  );

  return (
    <nav className="text-sm">
      <ul className={`hidden relative lg:w-56 lg:block group-data-[open=true]:block`}>
        <DocList />
        <MenuBlock>
          <TextMenuTitle
            text="Icons"
            href={`/${lang}/icons`}
            className={`group-has-[.docs-icons]:active-content`}
          />
          <SubMenu>
            <IconList />
          </SubMenu>
        </MenuBlock>
        <MenuBlock>
          <TextMenuTitle
            text="Roadmap"
            href={`/${lang}/roadmap`}
            className={`group-has-[.docs-roadmap]:active-content`}
          />
        </MenuBlock>
      </ul>
    </nav>
  );
};
