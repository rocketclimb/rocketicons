import { PropsWithChildrenAndLangParams } from "@/types";
import { CollapsedSidebar, SidebarLeft } from "@/components/documentation";

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildrenAndLangParams) => (
  <>
    <CollapsedSidebar lang={lang} />
    <div className="hidden lg:block group shrink-0 content-area pb-10 md:pr-7 lg:hover:overflow-y-auto">
      <SidebarLeft lang={lang} />
    </div>
    <div className="grow flex flex-col items-center mt-4 px-0.5 content-area pb-10 md:pr-7 mr-0 lg:mt-0  hover:overflow-y-auto">
      <article className="grow pt-5 has-[.collection-page]:pt-0">
        {children}
      </article>
      <div className="relative mx-auto w-full max-w-screen-xl px-4 py-10 md:flex md:flex-row md:py-10">
        footer
      </div>
    </div>
  </>
);

export default Layout;
