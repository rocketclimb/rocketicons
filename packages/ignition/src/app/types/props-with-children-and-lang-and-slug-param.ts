import { PropsWithChildren } from "react";
export type PropsWithChildrenAndLangAndSlugParams = PropsWithChildren & {
  params: Promise<{ lang: string; slug: string }>;
};
