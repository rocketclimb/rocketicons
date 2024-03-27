import { PropsWithChildren } from "react";
import { PropsWithLang } from "./props-with-lang";

export type PropsWithChildrenAndLangParams = PropsWithChildren & {
  params: PropsWithLang;
};
