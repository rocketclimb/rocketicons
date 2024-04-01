import { IoLogoGithub } from "rocketicons/io";
import Link from "next/link";
import MainNavAsMenu from "./main-nav-as-menu";
import { NavItem } from "./types";
import { PropsWithLang } from "@/types";
import ThemeSelector from "@/components/theme/theme-selector";
import { useLocale } from "@/locales";

const MainNav = ({ lang }: PropsWithLang) => {
  const { nav } = useLocale(lang).config();

  const navItems: NavItem[] = [
    {
      name: "docs",
      label: nav["docs"],
      link: `/${lang}/docs/${nav["usage-slug"]}`,
    },
    {
      name: "getting-started",
      label: nav["getting-started"],
      link: `/${lang}/docs/${nav["getting-started-slug"]}`,
    },
    { name: "icons", label: nav["icons"], link: `/${lang}/icons` },
  ];
  return (
    <>
      <div className="flex w-full items-center justify-end">
        <div className="hidden md:block">
          <ul className="flex items-center gap-x-7">
            {navItems.map(({ label, link }, i) => (
              <li
                className="font-semibold text-slate-700 text-sm leading-6 dark:text-slate-200"
                key={i}
              >
                <Link className="hover:text-sky-500" href={link}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:flex items-center border-l border-slate-200 ml-6 pl-6 dark:border-slate-800">
          <ThemeSelector lang={lang} />
          <a
            className="flex"
            href="https://github.com/rocketclimb/rocketicons"
            title="rockeicons @github.com/rocketclimb"
          >
            <IoLogoGithub className="ml-6 icon-slate-500 hover:icon-slate-600 dark:hover:icon-slate-400" />
          </a>
        </div>
      </div>
      <MainNavAsMenu navItems={navItems} lang={lang} />
    </>
  );
};

export default MainNav;
