import Link from "next/link";

import Logo from "./logo";
import Nav from "./nav";

import { PropsWithLang } from "@/types";

const LogoLink = () => {
  return (
    <Link href="/">
      <Logo className="w-[160px]" />
    </Link>
  );
};

const Header = ({ lang }: PropsWithLang) => {
  return (
    <div className="sticky flex top-0 z-40 w-full h-16 px-8 py-4 items-center backdrop-blur flex-none transition-colors duration-500 bg-white/95 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] dark:bg-transparent">
      <LogoLink />
      <Nav lang={lang} />
    </div>
  );
};

export default Header;
