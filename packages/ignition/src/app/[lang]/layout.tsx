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
      <div className="antialiased flex min-h-screen has-[.content-area]:max-h-screen flex-col has-[.content-area]:px-8 w-full text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <Header lang={lang} />
        <main className="flex grow gap-3">{children}</main>
      </div>
    </ModalContext>
  </ThemeContext>
);

export default Layout;
