import ModalContext from "@/components/modal-context";
import ThemeControl from "@/components/theme/theme-control";
import Header from "@/components/header";
import ContentKindMarker from "@/components/content-kind-marker";
import LocalePreference from "@/components/locale-preference";

import { PropsWithChildrenAndLangParams } from "@/types";
import type { Languages } from "@/types";
import { localePageParams } from "@/statics-generator/route-static-params";

export function generateStaticParams() {
  return localePageParams();
}

const Layout = async ({ children, params }: PropsWithChildrenAndLangParams) => {
  const { lang: rawLang } = await params;
  const lang = rawLang as Languages;
  return (
    <>
      <LocalePreference lang={lang} />
      <ContentKindMarker />
      <ThemeControl>
        <ModalContext>
          <Header lang={lang} />
          <div className="antialiased lg:flex lg:grow lg:min-h-0 mx-auto has-[.content-area]:px-0.5 has-[.content-area]:md:px-6 has-[.content-area]:max-w-screen-2xl w-full text-slate-500 dark:text-slate-400">
            <div className="lg:flex lg:flex-row lg:grow lg:min-h-0 lg:gap-3">{children}</div>
          </div>
        </ModalContext>
      </ThemeControl>
    </>
  );
};

export default Layout;
