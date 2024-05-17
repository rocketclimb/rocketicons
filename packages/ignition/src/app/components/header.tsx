import Link from "next/link";
import Logo from "./logo";
import MainNav from "./main-nav";
import { PropsWithLang } from "@/types/props-with-lang";
import { pkgVersion } from "@/data-helpers/icons/manifest";
import { CollapsedSidebar } from "@/components/sidebar/collapsed-sidebar";

const LogoLink = ({ lang }: PropsWithLang) => {
  return (
    <Link href={`/${lang}`}>
      <Logo className="w-[160px]" />
    </Link>
  );
};

const VersionLabel = () => (
  <span className="transition-all duration-200 landpage:hidden cursor-default mx-1 md:ml-5 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 bg-gray-200 dark:bg-slate-400/10 rounded-full py-1 px-3 items-center hover:bg-slate-400/20 dark:hover:bg-slate-400/40 text-nowrap">
    {pkgVersion}
  </span>
);

const Header = ({ lang }: PropsWithLang) => (
  <div className="fixed top-0 z-40 lg:static w-full landpage:pb-4 lg:pb-4 px-2 sm:px-8 pt-4 backdrop-blur transition-colors duration-500 bg-white/95 lg:z-50 border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] dark:bg-slate-900/70">
    <div className="flex mx-auto items-center w-full max-w-screen-2xl min-[1550px]:px-8">
      <LogoLink lang={lang} />
      <VersionLabel />
      <MainNav lang={lang} />
    </div>
    <CollapsedSidebar lang={lang} />
  </div>
);

export default Header;
