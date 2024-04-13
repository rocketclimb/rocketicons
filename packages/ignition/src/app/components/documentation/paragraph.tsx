import BaseDocElement, { DocElementProps } from "./base-doc-element";

const highlightStyle = `
  highlight:text-lg highlight:lg:text-lg highlight:my-5
  highlight:tracking-tight highlight:min-[714px]:mb-12
  highlight:md:tracking-normal highlight:md:mb-10 highlight:min-[1218px]:mb-5'
`;

const proseStyle = `
  prose:text-sm prose:tracking-tight prose:mb-2
`;

const thinStyle = `
  thin:my-1.5
`;

const Paragraph = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="p"
    defaultClassName={`group/p paragraph text-slate-700 dark:text-slate-400 font-normal text-sm mb-4 lg:text-base ${highlightStyle} ${proseStyle} ${thinStyle}`}
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Paragraph;
