import { HTMLAttributes, AnchorHTMLAttributes } from "react";
import { PropsWithChildrenAndClassName } from "@/types";

type GenericDocElement<T extends HTMLAttributes<HTMLElement>> = {
  overrideStyles?: boolean;
} & PropsWithChildrenAndClassName &
  T;

export type DocElementProps = GenericDocElement<HTMLAttributes<HTMLElement>>;

type DocumentTags = "h1" | "h2" | "h3" | "h4" | "p";
type AnchorTags = "a";
type AvailableTags = DocumentTags | AnchorTags;

type GenericTagsProps = {
  Tag: AvailableTags;
};

type GenericDocElementProps<T extends HTMLAttributes<HTMLElement>> = {
  defaultClassName?: string;
} & GenericDocElement<T>;

const GenericDocElement = <T extends HTMLAttributes<HTMLElement>>({
  Tag,
  overrideStyles,
  defaultClassName,
  className,
  children,
  ...props
}: GenericTagsProps & GenericDocElementProps<T>) => (
  <Tag {...props} className={`${!overrideStyles && (defaultClassName || "")} ${className || ""}`}>
    {children}
  </Tag>
);

type BaseDocElementProps = {
  Tag: DocumentTags;
};

const BaseDocElement = (
  props: BaseDocElementProps & GenericDocElementProps<HTMLAttributes<HTMLElement>>
) => <GenericDocElement {...props} />;

type AnchorDocElementProps = {
  Tag: AnchorTags;
};

export const AnchorDocElement = (
  props: AnchorDocElementProps & GenericDocElementProps<AnchorHTMLAttributes<HTMLElement>>
) => <GenericDocElement {...props} />;

export default BaseDocElement;
