import collections from "@/data-helpers/params/collections.json";
import { AvailableLanguages } from "@/types";

export const localePageParams = () => AvailableLanguages.map((lang) => ({ lang }));

export const collectionPageParams = () =>
  AvailableLanguages.flatMap((lang) =>
    collections.map(({ collectionid }) => ({ lang, collectionid }))
  );
