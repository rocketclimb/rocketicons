import { PropsWithLang } from "./props-with-lang";

export type PropsWithLangSlugParams = {
  params: PropsWithLang & { slug: string };
};
