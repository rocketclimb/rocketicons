import { allDocs, allComponents } from "content-collections";
import { Languages } from "@/types";
import en from "./en.json";
import ptBr from "./pt-br.json";

type Collection = typeof allDocs | typeof allComponents;

export const useLocale = (lang: Languages, slug?: string) => {
  const locales: Record<Languages, any> = {
    en: en,
    "pt-br": ptBr,
  };

  const findOnCollection = (collection: Collection) =>
    (slug &&
      collection.find(
        (model) => model.slug === slug && model.locale === (lang || "en")
      )) ||
    ({} as any);

  return {
    config: () => locales[lang],
    doc: () => findOnCollection(allDocs),
    component: () => findOnCollection(allComponents),
  };
};
