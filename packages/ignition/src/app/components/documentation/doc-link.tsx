import { DocElementProps, AnchorDocElement } from "./base-doc-element";

type DocLinkProps = {
  external?: boolean;
  href: string;
} & DocElementProps;

const DocLink = ({ href, className, external, children }: DocLinkProps) => (
  <AnchorDocElement
    Tag="a"
    href={href}
    className={`hover:text-primary-darken hover:dark:text-primary-bright group-[.paragraph]/p:font-semibold group-[.paragraph]/p:dark:text-primary-dark group-[.paragraph]/p:border-b group-[.paragraph]/p:border-secondary group-[.paragraph]/p:hover:border-b-2  ${
      className || ""
    }`}
    {...((external && { target: "_blank" }) || {})}
  >
    {children || href}
  </AnchorDocElement>
);

export default DocLink;
