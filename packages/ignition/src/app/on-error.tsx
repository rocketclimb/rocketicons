import ThemeControl from "@/components/theme/theme-control";
import ModalContext from "@/components/modal-context";
import SearchButton from "@/components/search/search";
import MainNav from "@/components/main-nav";
import { withLocale } from "@/locales";
import { PropsWithChildrenAndLang } from "@/types";

type OnErrorProps = {
  error: "error_404" | "error_500";
} & PropsWithChildrenAndLang;

const OnError = ({ error, lang, children }: OnErrorProps) => {
  const errorNumber = error.replace("error_", "");
  const errorMsg = withLocale(lang).config("errors")[error];
  return (
    <ThemeControl>
      <ModalContext>
        <div className="relative w-full h-dvh flex justify-end items-center overflow-hidden">
          <div className="text-right pr-10 md:pr-20">
            <h1 className="text-8xl tracking-tight font-extrabold default-text-color">
              {errorNumber}
            </h1>
            <h2 className="text-2xl my-6 tracking-tight font-bold default-text-color">
              {errorMsg}
            </h2>
            <SearchButton lang={lang} asInput />
            <MainNav lang={lang} asList />
          </div>
          {children}
        </div>
      </ModalContext>
    </ThemeControl>
  );
};

export default OnError;
