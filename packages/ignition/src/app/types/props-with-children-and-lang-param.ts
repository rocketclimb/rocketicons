import { PropsWithChildren } from "react";
export type PropsWithChildrenAndLangParams = PropsWithChildren & {
  params: Promise<{ lang: string }>;
};
