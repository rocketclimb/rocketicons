import { PropsWithLang } from "@/types";
import { withLocale } from "@/locales";
import { DependencyList } from "react";

type Callback = <T extends Function>(callback: T, deps: DependencyList) => T;

export type MdxPartialProps = {
  slug: string;
  path: "docs" | "components";
} & PropsWithLang;

type CacheFunctionProps = {
  callback?: Callback;
  deps?: DependencyList;
};

export const MdxPartial = async ({
  lang,
  slug: unparsedSlug,
  path,
  callback,
  deps
}: MdxPartialProps & CacheFunctionProps) => {
  const [slug, componentSlug] = unparsedSlug.split("/");
  const { component, doc } = withLocale(lang);

  const loadDoc = () => {
    const loaded = doc(slug);
    return (componentSlug && loaded["components"][componentSlug]) || loaded;
  };

  const selectedDoc = path === "docs" ? loadDoc() : component(slug);

  callback = callback || (((cb: any, _deps: DependencyList) => cb) as Callback);

  const loadMdx = callback(
    async () => {
      const selectedDoc = path === "docs" ? loadDoc() : component(slug);
      return (await import(`@/locales/${path}/${selectedDoc?.filePath}`)).default
    },
    deps || []
  );

  const DynamicMarkDownComponent = await loadMdx();
  return <>{selectedDoc && <DynamicMarkDownComponent />}</>;
};
