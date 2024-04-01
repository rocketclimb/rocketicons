import { PropsWithChildrenAndLangParams } from "@/types";
import { CollapsedSidebar, SidebarLeft } from "@/components/documentation";

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildrenAndLangParams) => (
  <div className="xl:mx-auto pt-6 flex gap-8 w-full max-w-screen-2xl">
    <div className="group">
      <CollapsedSidebar lang={lang} />
      <SidebarLeft lang={lang} />
    </div>
    <article className="grow">{children}</article>
    {/* <div className="relative mx-auto w-full max-w-screen-xl px-4 py-10 md:flex md:flex-row md:py-10">
      footer
    </div> */}
  </div>
);

export default Layout;
