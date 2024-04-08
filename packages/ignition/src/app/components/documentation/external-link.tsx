import { PropsWithChildrenAndClassName } from "@/app/types";

type ExternalLinkProps = {
  href: string;
} & PropsWithChildrenAndClassName;

const ExternalLink = ({ href, className, children }: ExternalLinkProps) => (
  <a
    target="_blank"
    href={href}
    className={`hover:text-slate-700 hover:dark:text-slate-300 group-[.paragraph]/p:font-semibold group-[.paragraph]/p:dark:text-white group-[.paragraph]/p:border-b group-[.paragraph]/p:border-sky-500 group-[.paragraph]/p:hover:border-b-2  ${
      className || ""
    }`}
  >
    {children || href}
  </a>
);

export default ExternalLink;
