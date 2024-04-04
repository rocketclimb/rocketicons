import "@/utils";

import { IconsManifest } from "rocketicons/data";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { PropsWithLang } from "@/types";
import RocketIconsText from "@/components/rocketicons-text";
import { allDocs } from "content-collections";
import { siteConfig } from "@/config/site";
import { useLocale } from "@/locales";

const SelectedClassName = (slug: string) =>
  `group-has-[.docs-${slug}]:active-content`;

const TextMenuTitle = ({
  text,
  href,
  className,
}: {
  text: string;
  href: string;
  className?: string;
}) => (
  <MenuTitle href={href} className={className}>
    <span className={className}>{text}</span>
  </MenuTitle>
);

const MenuTitle = ({
  href,
  className,
  children,
}: PropsWithChildren & { href: string; className?: string }) => (
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
  children,
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
  const { nav: navEng } = useLocale("en").config();
  const { nav } = useLocale(lang).config();

  const DocList = () => {
    const grouped = allDocs
      .filter((model) => model.locale === lang && !!model.group)
      .groupBy((doc) => doc.group);

    const renderDocList = () => {
      return (
        <>
          {Array.from(grouped).map(
            ([group, docs]) =>
              group && (
                <MenuBlock key={group}>
                  <TextMenuTitle
                    text={nav[group]}
                    href={`/${lang}/docs/${nav[`${group}-slug`]}`}
                    className={SelectedClassName(nav[`${group}-slug`])}
                  />
                  <SubMenu>
                    {docs
                      .sort((a, b) => a.order - b.order)
                      .map(
                        (model, i) =>
                          (siteConfig.menuConfig.componentGroups.indexOf(
                            navEng[`${group}-slug`]
                          ) > -1 ||
                            !model.isComponent) && (
                            <li key={i}>
                              <MenuItem
                                href={
                                  model.isComponent
                                    ? `/${lang}/docs/${nav[`${group}-slug`]}#${
                                        model.slug
                                      }`
                                    : `/${lang}/docs/${model.slug}`
                                }
                                className={model.activeSelector}
                              >
                                <span className={model.activeSelector}>
                                  {model.title}
                                </span>
                              </MenuItem>
                            </li>
                          )
                      )}
                  </SubMenu>
                </MenuBlock>
              )
          )}
        </>
      );
    };

    return renderDocList();
  };

  const IconList = () => (
    <>
      {IconsManifest.map(
        ({ id, name }: { id: string; name: string }, i: number) => (
          <li key={i}>
            <MenuItem
              href={`/${lang}/icons/${id}`}
              className={SelectedClassName(id)}
            >
              {(name === "rocketclimb" && (
                <RocketIconsText className="text-gray-950 hover:text-sky-500 dark:text-neutral-100 dark:hover:text-sky-500" />
              )) ||
                name}
            </MenuItem>
          </li>
        )
      )}
    </>
  );

  return (
    <nav className="text-sm">
      <ul
        className={`hidden relative lg:w-56 lg:block group-data-[open=true]:block`}
      >
        <DocList />
        <MenuBlock>
          <TextMenuTitle
            text="Icons"
            href={`/${lang}/icons`}
            className={SelectedClassName("icons")}
          />
          <SubMenu>
            <IconList />
          </SubMenu>
        </MenuBlock>
      </ul>
    </nav>
  );
};
