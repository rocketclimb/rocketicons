import Link from "next/link";
import { PropsWithLang } from "@/types";
import Logo from "./logo";
import MainNav from "./main-nav";

const LogoLink = ({ lang }: PropsWithLang) => {
  return (
    <Link href={`/${lang}`}>
      <Logo className="w-[160px]" />
    </Link>
  );
};

const Header = ({ lang }: PropsWithLang) => (
  <div className="sticky top-0 z-40 w-full h-16 px-8 py-4 backdrop-blur transition-colors duration-500 bg-white/95 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] dark:bg-transparent">
    <div className="flex mx-auto items-center max-w-screen-2xl">
      <LogoLink lang={lang} />
      <MainNav lang={lang} />
    </div>
  </div>
);

export default Header;
// flex-none
