import { PropsWithClassName, PropsWithLang } from "@/types";
import dynamic from "next/dynamic";
import { useLocale } from "@/app/locales";
import { DependencyList } from "react";

type Callback = <T extends Function>(callback: T, deps: DependencyList) => T;

export type MdxPartialProps = {
  slug: string;
  path: "docs" | "components";
} & PropsWithLang &
  PropsWithClassName;

type CacheFunctionProps = {
  callback?: Callback;
  deps?: DependencyList;
};

export const MdxPartial = ({
  lang,
  slug: unparsedSlug,
  path,
  className,
  callback,
  deps,
}: MdxPartialProps & CacheFunctionProps) => {
  const [slug, componentSlug] = unparsedSlug.split("/");
  const locale = useLocale(lang, slug);

  const loadDoc = () => {
    const doc = locale.docFromIndex();
    return (componentSlug && doc["components"][componentSlug]) || doc;
  };

  const selectedDoc =
    path === "docs" ? loadDoc() : locale.pageComponentFromIndex();

  callback = callback || (((cb: any, _deps: DependencyList) => cb) as Callback);

  const DynamicMarkDownComponent = callback(
    dynamic(() => import(`@/locales/${path}/${selectedDoc?.filePath}`), {
      loading: () => <p className={className || ""}>Loading...</p>,
    }),
    deps || []
  );

  return <>{selectedDoc && <DynamicMarkDownComponent />}</>;
};
