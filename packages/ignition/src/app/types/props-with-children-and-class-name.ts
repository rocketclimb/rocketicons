import { PropsWithChildren } from "react";
import { PropsWithClassName } from "./props-with-class-name";

export type PropsWithChildrenAndlassName = PropsWithChildren &
  PropsWithClassName;
