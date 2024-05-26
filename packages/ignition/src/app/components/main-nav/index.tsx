import Link from "next/link";
import MainNavAsMenu from "./main-nav-as-menu";
import { NavItem } from "./types";
import { PropsWithLang } from "@/types";
import ThemeSelector from "@/components/theme/theme-selector";
import { withLocale } from "@/locales/with-locale";
import GitHubIcon from "@/components/github-icon";

type MainNavProps = {
  asList?: boolean;
} & PropsWithLang;

const MainNav = ({ lang, asList }: MainNavProps) => {
  const nav = withLocale(lang).config("nav");

  const navItems: NavItem[] = [
    {
      name: "docs",
      label: nav["docs"],
      link: `/${lang}/docs/${nav["usage-slug"]}`
    },
    {
      name: "getting-started",
      label: nav["getting-started"],
      link: `/${lang}/docs/${nav["getting-started-slug"]}`
    },
    {
      name: "icons",
      label: nav["icons"],
      link: `/${lang}/icons`
    }
  ];
  return (
    <>
      <div
        data-as-list={!!asList}
        className="group/main-nav hidden lg:flex data-[as-list=true]:block data-[as-list=true]:mt-6 w-full items-center justify-end"
      >
        <ul className="group-data-[as-list=false]/main-nav:flex group-data-[as-list=false]/main-nav:items-center gap-x-7">
          {navItems.map(({ label, link }, i) => (
            <li
              className="group-data-[as-list=true]/main-nav:mb-1.5 group-data-[as-list=true]/main-nav:text-sm group-data-[as-list=true]/main-nav:w-fit group-data-[as-list=true]/main-nav:ml-auto group-data-[as-list=true]/main-nav:border-b group-data-[as-list=true]/main-nav:border-secondary font-semibold text-slate-700 text-sm leading-6 dark:text-slate-200"
              key={i}
            >
              <Link className="hover:text-secondary" href={link}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        {!asList && (
          <div className="hidden lg:flex items-center border-l border-slate-200 ml-6 pl-6 dark:border-slate-800">
            <ThemeSelector lang={lang} />
            <GitHubIcon className="ml-6" />
          </div>
        )}
      </div>
      {!asList && <MainNavAsMenu navItems={navItems} lang={lang} />}
    </>
  );
};

export default MainNav;
