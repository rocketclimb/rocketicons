import { CollapsedSidebar, SidebarLeft } from "@/components/documentation";

import Footer from "./footer";
import { PropsWithChildrenAndLangParams } from "@/types";

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildrenAndLangParams) => (
  <>
    <CollapsedSidebar lang={lang} />
    <div className="hidden lg:block group shrink-0 content-area pb-10 md:pr-7 lg:hover:overflow-y-auto">
      <SidebarLeft lang={lang} />
    </div>
    <div className="grow flex flex-col items-center mt-4 px-0.5 content-area md:pr-7 mr-0 lg:mt-0 hover:overflow-y-auto">
      <article className="grow shrink-0 w-full pt-5 has-[.collection-page]:pt-0">
        {children}
      </article>
      <Footer />
    </div>
  </>
);

export default Layout;
