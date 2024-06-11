import { PropsWithChildren } from "react";
import { PropsWithClassName } from "./props-with-class-name";
import { PropsWithLang } from "./props-with-lang";

export type PropsWithChildrenAndClassNameAndLang = PropsWithChildren &
  PropsWithClassName &
  PropsWithLang;
