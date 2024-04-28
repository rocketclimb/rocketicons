import Link from "next/link";
import Logo from "./logo";
import MainNav from "./main-nav";
import { PropsWithLang } from "@/app/types/props-with-lang";
import { pkgVersion } from "@/data-helpers/icons/manifest";

const LogoLink = ({ lang }: PropsWithLang) => {
  return (
    <Link href={`/${lang}`}>
      <Logo className="w-[160px]" />
    </Link>
  );
};

const VersionLabel = () => (
  <span className="transition-all duration-200 cursor-default ml-5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-gray-200 dark:bg-slate-400/10 rounded-full py-1 px-3 items-center hover:bg-slate-400/20 dark:hover:bg-slate-400/40 ">
    {pkgVersion}
  </span>
);

const Header = ({ lang }: PropsWithLang) => (
  <div className="sticky top-0 z-40 w-full h-16 px-2 sm:px-8 py-4 backdrop-blur transition-colors duration-500 bg-white/95 lg:z-50  lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] dark:bg-slate-900/70">
    <div className="flex mx-auto items-center max-w-screen-2xl min-[1550px]:px-8">
      <LogoLink lang={lang} />
      <VersionLabel />
      <MainNav lang={lang} />
    </div>
  </div>
);

export default Header;
