import "@/utils";
import { PropsWithChildren } from "react";
import { IconsManifest } from "rocketicons/data";
import Link from "next/link";
import { allDocs } from "content-collections";
import { PropsWithLang } from "@/types";
import { useLocale } from "@/locales";
import RocketIconsText from "@/components/rocketicons-text";

const MenuTitle = ({ children }: PropsWithChildren) => (
  <h5 className="mb-8 lg:mb-3 font-semibold text-slate-900 dark:text-slate-200">
    {children}
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
}: PropsWithChildren & { href: string; className?: string }) => (
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
  const { nav } = useLocale(lang).config();

  const DocList = () => {
    const grouped = allDocs
      .filter((model) => model.locale === lang && !model.hide && !!model.group)
      .groupBy((doc) => doc.group);

    const renderDocList = () => {
      return (
        <>
          {Array.from(grouped).map(
            ([group, docs]) =>
              group && (
                <MenuBlock key={group}>
                  <MenuTitle>{nav[group]}</MenuTitle>
                  <SubMenu>
                    {docs
                      .sort((a, b) => a.order - b.order)
                      .map((model, i) => (
                        <li key={i}>
                          <MenuItem
                            href={`/${lang}/docs/${model.slug}`}
                            className={model.activeSelector}
                          >
                            <span className={model.activeSelector}>
                              {model.title}
                            </span>
                          </MenuItem>
                        </li>
                      ))}
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
      {IconsManifest.map(({ id, name }, i) => (
        <li key={i}>
          <MenuItem href={`/${lang}/icons/${id}`}>
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
      <ul className={`hidden lg:block group-data-[open=true]:block`}>
        <DocList />
        <MenuBlock>
          <MenuTitle>
            <Link href={`/${lang}/icons`}>Icons</Link>
          </MenuTitle>
          <SubMenu>
            <IconList />
          </SubMenu>
        </MenuBlock>
      </ul>
    </nav>
  );
};
