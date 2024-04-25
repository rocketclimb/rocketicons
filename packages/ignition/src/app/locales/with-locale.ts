import { Languages } from "@/types";
import { docIndex, pageComponentIndex } from "content-collections";
import { Config, Configs, SelectedConfig } from "./types";

export const withLocale = (lang: Languages) => {
  const getContentFromIndex = (slug: string, { docs, slugMap }: Record<string, any>) => {
    const enSlug = enSlugFromIndex(slug, { docs, slugMap });
    return docs[enSlug] && docs[enSlug][lang];
  };

  const enSlugFromIndex = (slug: string, { docs, slugMap }: Record<string, any>) =>
    (slug && docs[slug] && docs[slug]["en"] && slug) || slugMap[slug || ""];

  const getConfigFromIndex = <T extends Configs>(slug: T): Config[T] =>
    docIndex["config"][slug][lang || "en"];

  const getConfigsFromIndex = <T extends Configs>(slugs: T[]): SelectedConfig<T> =>
    slugs.reduce(
      (reduced, slug) => ({
        ...reduced,
        [slug]: getConfigFromIndex(slug)
      }),
      {} as { [I in T]: Config[I] }
    );

  function config<T extends Configs>(slug: T): Config[T];
  function config<T extends Configs>(...slugs: T[]): SelectedConfig<T>;
  function config<T extends Configs>(...args: T[]): SelectedConfig<T> | Config[T] {
    return args.length === 1 ? getConfigFromIndex(args.shift()!) : getConfigsFromIndex(args);
  }

  return {
    enSlug: (slug: string) => enSlugFromIndex(slug, docIndex),
    docs: () => docIndex["docs"],
    doc: (slug: string) => getContentFromIndex(slug, docIndex),
    component: (slug: string) => getContentFromIndex(slug, pageComponentIndex),
    config
  };
};
