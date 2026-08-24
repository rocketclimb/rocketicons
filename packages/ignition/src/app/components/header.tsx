import Link from "next/link";
import Logo from "./logo";
import MainNav from "./main-nav";
import { PropsWithLang } from "@/types/props-with-lang";
import { pkgVersion } from "@/data-helpers/icons/manifest";
import { CollapsedSidebar } from "@/components/sidebar/collapsed-sidebar";

const LogoLink = ({ lang }: PropsWithLang) => {
  return (
    <Link className="col-span-5" href={`/${lang}`}>
      <Logo className="w-full max-w-[160px]" />
    </Link>
  );
};

const VersionLabel = () => (
  <span className="transition-all duration-200 col-span-3 text-center max-w-20 md:max-w-28 landingpage:hidden cursor-default mx-1 md:ml-5 text-[10px] sm:text-xs font-medium text-primary-light dark:text-primary-lighter bg-surface-border-light dark:bg-surface-border-lighter/10 rounded-full py-1 px-3 items-center hover:bg-surface-border-lighter/20 dark:hover:bg-surface-border-lighter/40 text-nowrap">
    {pkgVersion}
  </span>
);

const Header = ({ lang }: PropsWithLang) => (
  <div className="fixed top-0 z-40 lg:static w-full landingpage:pb-4 lg:pb-4 px-2 sm:px-8 pt-4 backdrop-blur transition-colors duration-500 bg-background/95 lg:z-50 border-b lg:border-surface-border-dark/10 dark:border-surface-border/10 dark:bg-background-dark/70">
    <div className="grid gap-0.5 grid-cols-10 md:flex mx-auto items-center w-full max-w-screen-2xl min-[1550px]:px-8">
      <LogoLink lang={lang} />
      <VersionLabel />
      <MainNav lang={lang} />
    </div>
    <CollapsedSidebar lang={lang} />
  </div>
);

export default Header;
