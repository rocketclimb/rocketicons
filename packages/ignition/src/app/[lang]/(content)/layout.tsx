import { SidebarLeft, MenuItem } from "@/components/sidebar/sidebar-left";
import Footer from "@/components/footer";
import { PropsWithChildrenAndLangParams } from "@/types";
import RocketIconsText from "@/components/rocketicons-text";
import { getCollections } from "@/catalog/server";
import type { Languages } from "@/types";

const Layout = async ({ children, params }: PropsWithChildrenAndLangParams) => {
  const { lang: rawLang } = await params;
  const lang = rawLang as Languages;
  const collections = await getCollections();
  return (
    <>
      <div className="hidden lg:block group shrink-0 content-area pb-10 md:pr-7 lg:hover:overflow-y-auto">
        <SidebarLeft lang={lang}>
          {collections.map(({ id, name }) => (
            <li key={`${id}-${name}`}>
              <MenuItem href={`/${lang}/icons/${id}/`}>
                {(name === "rocketclimb" && (
                  <RocketIconsText className="hover:text-secondary" />
                )) ||
                  name}
              </MenuItem>
            </li>
          ))}
        </SidebarLeft>
      </div>
      <div className="lg:grow lg:flex lg:flex-col lg:items-center lg:mt-0 lg:pt-0 mt-20 pt-2 px-1 xs:px-1.5 content-area lg:overflow-y-auto md:pr-7 mr-0">
        <main className="lg:grow lg:flex-shrink-0 w-full pt-5 has-[.collection-page]:pt-0">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
