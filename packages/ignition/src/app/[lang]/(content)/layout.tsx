import { CollapsedSidebar } from "@/components/documentation/collapsed-sidebar";
import { SidebarLeft } from "@/components/documentation/sidebar-left";

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
      <CollapsedSidebar lang={lang} />
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
      <div className="grow flex flex-col items-center mt-4 px-0.5 content-area overflow-y-auto md:pr-7 mr-0 lg:mt-0">
        <article className="grow w-full pt-5 has-[.collection-page]:pt-0">{children}</article>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
