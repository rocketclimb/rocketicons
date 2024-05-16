import { SidebarLeft } from "@/components/sidebar/sidebar-left";

import Footer from "@/components/footer";
import { PropsWithChildrenAndLangParams } from "@/types";
import { config } from "@/config";
import Link from "next/link";
import { withLocale } from "@/app/locales";
import { HiPlay } from "rocketicons/hi2";

const Layout = async ({ children, params: { lang } }: PropsWithChildrenAndLangParams) => {
  const playgroundUrl = await config.getPlaygroundUrl();
  const nav = withLocale(lang).config("nav");

  return (
    <>
      <div className="hidden lg:block group shrink-0 content-area pb-10 md:pr-7 lg:hover:overflow-y-auto">
        {playgroundUrl && (
          <div className="flex flex-row mt-3 items-center text-sm">
            <HiPlay className="icon-slate-500-sm" />
            <Link
              className="block border-l-ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
              href={playgroundUrl.toString()}
              target="_blank"
            >
              {nav["try-it"]}
            </Link>
          </div>
        )}
        <SidebarLeft lang={lang} />
      </div>
      <div className="lg:grow lg:flex lg:flex-col lg:items-center lg:mt-0 lg:pt-0 mt-20 pt-2 px-0.5 content-area lg:overflow-y-auto md:pr-7 mr-0">
        <article className="lg:grow lg:flex-shrink-0 w-full pt-5 has-[.collection-page]:pt-0">
          {children}
        </article>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
