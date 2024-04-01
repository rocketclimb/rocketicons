import { PropsWithChildrenAndLangParams } from "@/types";
import { CollapsedSidebar, SidebarLeft } from "@/components/documentation";

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildrenAndLangParams) => (
  <>
    <div className="group shrink-0 content-area pb-10 lg:pr-7 lg:hover:overflow-y-auto">
      <CollapsedSidebar lang={lang} />
      <SidebarLeft lang={lang} />
    </div>
    <div className="grow flex flex-col content-area pb-10 pr-7 hover:overflow-y-auto">
      <article className="grow pt-5">{children}</article>
      <div className="relative mx-auto w-full max-w-screen-xl px-4 py-10 md:flex md:flex-row md:py-10">
        footer
      </div>
    </div>
  </>
);

export default Layout;
