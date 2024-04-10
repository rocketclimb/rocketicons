import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Paragraph = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="p"
    defaultClassName="group/p paragraph text-slate-700 dark:text-slate-400 font-normal text-sm highlight:text-lg lg:text-base highlight:lg:text-lg highlight:my-5 highlight:tracking-tight highlight:min-[714px]:mb-12 highlight:md:tracking-normal highlight:md:mb-10 highlight:min-[1218px]:mb-5"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Paragraph;
