//import { allComponents, allDocs } from "content-collections";

import { Languages } from "@/types";
// import en from "./en.json";
// import ptBr from "./pt-br.json";
// import { redirect } from "next/navigation";
// import { allPageComponents, allDocs } from "content-collections";
import { docIndex, pageComponentIndex } from "content-collections";

// const allDocs = {} as any,
//   allComponents = {} as any;

// type Collection = typeof allDocs | typeof allPageComponents;

export const useLocale = (
  lang: Languages,
  slug?: string,
  noRedirect?: boolean
) => {
  // const locales: Record<Languages, any> = {
  //   en: en,
  //   "pt-br": ptBr,
  // };

  // const findOnCollection = (collection: Collection) => {
  //   let selectedDoc =
  //     slug &&
  //     collection.find(
  //       (model) => model.slug === slug && model.locale === (lang || "en")
  //     );

  //   if (!!selectedDoc) {
  //     return selectedDoc;
  //   } else {
  //     const docsBySlug = collection.filter(
  //       (model) => model.slug === slug || model.enslug === slug
  //     );

  //     if (docsBySlug && docsBySlug.length) {
  //       const docByEnslug =
  //         collection.find(
  //           (model) =>
  //             model.enslug === docsBySlug[0].enslug &&
  //             model.locale === (lang || "en")
  //         ) || ({} as any);

  //       if (noRedirect) {
  //         return docByEnslug;
  //       } else {
  //         redirect(docByEnslug.slug);
  //       }
  //     }
  //   }
  // };

  const docFromIndex = (index: Record<string, any>) => {
    let enSlug = index["slugMap"][slug || ""];

    return slug ? index["docs"][enSlug || slug][lang || "en"] : index["docs"];
  };

  const enSlugFromIndex = (index: Record<string, any>) => {
    return index["slugMap"][slug || ""];
  };
  const configFromIndex = (index: Record<string, any>) => {
    return slug ? index["config"][slug][lang] : index["config"];
  };

  return {
    // config: () => locales[lang],
    // component: () =>
    //   findOnCollection(allPageComponents) ||
    //   findOnCollection(allDocs) ||
    //   ({} as any),
    docFromIndex: () => docFromIndex(docIndex),
    enSlugFromIndex: () => enSlugFromIndex(docIndex),
    configFromIndex: () => configFromIndex(docIndex),
    pageComponentFromIndex: () => docFromIndex(pageComponentIndex),
  };
};
