import ModalContext from "@/app/components/modal-context";
import ThemeContext from "@/app/components/theme/theme-context";
import Header from "@/app/components/header";

import { PropsWithChildrenAndLangParams } from "@/types";

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildrenAndLangParams) => (
  <ThemeContext>
    <ModalContext>
      <Header lang={lang} />
      <div className="antialiased mx-auto has-[.content-area]:px-0.5 has-[.content-area]:sm:px-8 has-[.content-area]:max-w-screen-2xl w-full text-slate-500 dark:text-slate-400">
        <main className="flex flex-col lg:flex-row grow gap-3">{children}</main>
      </div>
    </ModalContext>
  </ThemeContext>
);

export default Layout;
