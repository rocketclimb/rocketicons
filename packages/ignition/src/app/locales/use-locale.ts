//import { allComponents, allDocs } from "content-collections";

import { Languages } from "@/types";
import en from "./en.json";
import ptBr from "./pt-br.json";
import { redirect } from "next/navigation";
import { allComponents, allDocs } from "content-collections";
import { allMdxIndices } from "content-collections";

// const allDocs = {} as any,
//   allComponents = {} as any;

type Collection = typeof allDocs | typeof allComponents;

export const useLocale = (
  lang: Languages,
  slug?: string,
  noRedirect?: boolean
) => {
  const locales: Record<Languages, any> = {
    en: en,
    "pt-br": ptBr,
  };

  const findOnCollection = (collection: Collection) => {
    let selectedDoc =
      slug &&
      collection.find(
        (model) => model.slug === slug && model.locale === (lang || "en")
      );

    if (!!selectedDoc) {
      return selectedDoc;
    } else {
      const docsBySlug = collection.filter(
        (model) => model.slug === slug || model.enslug === slug
      );

      if (docsBySlug && docsBySlug.length) {
        const docByEnslug =
          collection.find(
            (model) =>
              model.enslug === docsBySlug[0].enslug &&
              model.locale === (lang || "en")
          ) || ({} as any);

        if (noRedirect) {
          return docByEnslug;
        } else {
          redirect(docByEnslug.slug);
        }
      }
    }
  };

  const navigationFromIndex = (index: Record<string, any>) => {
    return lang ? index["config"]["nav"][lang || "en"] : index["config"]["nav"];
  };

  const docFromIndex = (index: Record<string, any>) => {
    let enSlug = index["slugMap"][slug || ""];

    return slug ? index["docs"][enSlug || slug][lang || "en"] : index["docs"];
  };

  const enSlugFromIndex = (index: Record<string, any>) => {
    return index["slugMap"][slug || ""];
  };

  return {
    config: () => locales[lang],
    doc: () => findOnCollection(allDocs),
    component: () =>
      findOnCollection(allComponents) ||
      findOnCollection(allDocs) ||
      ({} as any),
    navigationFromIndex: () => navigationFromIndex(allMdxIndices),
    docFromIndex: () => docFromIndex(allMdxIndices),
    enSlugFromIndex: () => enSlugFromIndex(allMdxIndices),
  };
};
