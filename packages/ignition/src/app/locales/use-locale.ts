import { Languages } from "@/types";
import { docIndex, pageComponentIndex } from "content-collections";
import { Config, Configs, SelectedConfig } from "./types";

export const useLocale = (lang: Languages, slug?: string) => {
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

  const getConfigFromIndex = <T extends Configs>(slug: T): Config[T] =>
    docIndex["config"][slug][lang];

  const getConfigsFromIndex = <T extends Configs>(
    slugs: T[]
  ): SelectedConfig<T> =>
    slugs.reduce(
      (reduced, slug) => ({
        ...reduced,
        [slug]: getConfigFromIndex(slug),
      }),
      {} as { [I in T]: Config[I] }
    );

  function config<T extends Configs>(slug: T): Config[T];
  function config<T extends Configs>(...slugs: T[]): SelectedConfig<T>;
  function config<T extends Configs>(
    ...args: T[]
  ): SelectedConfig<T> | Config[T] {
    return args.length === 1
      ? getConfigFromIndex(args.shift()!)
      : getConfigsFromIndex(args);
  }

  return {
    docFromIndex: () => docFromIndex(docIndex),
    enSlugFromIndex: () => enSlugFromIndex(docIndex),
    configFromIndex: () => configFromIndex(docIndex),
    pageComponentFromIndex: () => docFromIndex(pageComponentIndex),
    config,
  };
};
