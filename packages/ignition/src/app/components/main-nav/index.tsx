import { IoLogoGithub } from "rocketicons/io";
import Link from "next/link";
import MainNavAsMenu from "./main-nav-as-menu";
import { NavItem } from "./types";
import { PropsWithLang } from "@/types";
import ThemeSelector from "@/components/theme/theme-selector";
import { useLocale } from "@/locales/use-locale";
import GitHubIcon from "@/components/github-icon";

const MainNav = ({ lang }: PropsWithLang) => {
  const nav = useLocale(lang).config("nav");

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
    {
      name: "icons",
      label: nav["icons"],
      link: `/${lang}/icons`,
    },
  ];
  return (
    <>
      <div className="flex w-full items-center justify-end">
        <div className="hidden lg:block">
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
        <div className="hidden lg:flex items-center border-l border-slate-200 ml-6 pl-6 dark:border-slate-800">
          <ThemeSelector lang={lang} />
          <GitHubIcon />
        </div>
      </div>
      <MainNavAsMenu navItems={navItems} lang={lang} />
    </>
  );
};

export default MainNav;
