import { SidebarLeft } from "@/components/sidebar/sidebar-left";
import Footer from "@/components/footer";
import { PropsWithChildrenAndLangParams } from "@/types";

const Layout = async ({ children, params: { lang } }: PropsWithChildrenAndLangParams) => (
  <>
    <div className="hidden lg:block group shrink-0 content-area pb-10 md:pr-7 lg:hover:overflow-y-auto">
      <SidebarLeft lang={lang} />
    </div>
    <div className="lg:grow lg:flex lg:flex-col lg:items-center lg:mt-0 lg:pt-0 mt-20 pt-2 px-1 xs:px-1.5 content-area lg:overflow-y-auto md:pr-7 mr-0">
      <main className="lg:grow lg:flex-shrink-0 w-full pt-5 has-[.collection-page]:pt-0">
        {children}
      </main>
      <Footer />
    </div>
  </>
);

export default Layout;
