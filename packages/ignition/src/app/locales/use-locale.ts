import { allComponents, allDocs } from "content-collections";

import { Languages } from "@/types";
import en from "./en.json";
import ptBr from "./pt-br.json";
import { redirect } from "next/navigation";

type Collection = typeof allDocs | typeof allComponents;

export const useLocale = (lang: Languages, slug?: string) => {
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
        const docsByEnslug =
          collection.find(
            (model) =>
              model.enslug === docsBySlug[0].enslug &&
              model.locale === (lang || "en")
          ) || ({} as any);

        if (docsByEnslug) {
          redirect(docsByEnslug.slug);
        }
      }
    }
  };

  return {
    config: () => locales[lang],
    doc: () => findOnCollection(allDocs),
    component: () => findOnCollection(allComponents),
  };
};
