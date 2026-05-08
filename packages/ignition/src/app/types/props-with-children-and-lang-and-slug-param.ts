import { PropsWithChildren } from "react";
import { PropsWithLang } from "./props-with-lang";

export type PropsWithChildrenAndLangAndSlugParams = PropsWithChildren & {
  params: Promise<{ lang: string; slug: string }>;
};
