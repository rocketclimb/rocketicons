import { DocElementProps, AnchorDocElement } from "./base-doc-element";

type DocLinkProps = {
  external?: boolean;
  href: string;
} & DocElementProps;

const DocLink = ({ href, className, external, children }: DocLinkProps) => (
  <AnchorDocElement
    Tag="a"
    href={href}
    className={`hover:text-slate-700 hover:dark:text-slate-300 group-[.paragraph]/p:font-semibold group-[.paragraph]/p:dark:text-white group-[.paragraph]/p:border-b group-[.paragraph]/p:border-sky-500 group-[.paragraph]/p:hover:border-b-2  ${
      className || ""
    }`}
    {...((external && { target: "_blank" }) || {})}
  >
    {children || href}
  </AnchorDocElement>
);

export default DocLink;
