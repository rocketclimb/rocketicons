import BaseDocElement, { DocElementProps } from "./base-doc-element";

const highlightStyle = `
  highlight:text-lg highlight:lg:text-lg highlight:my-5
  highlight:tracking-tight highlight:min-[714px]:mb-12
  highlight:md:tracking-normal highlight:md:mb-10 highlight:min-[1218px]:mb-5
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
    defaultClassName={`group/p paragraph text-slate-700 dark:text-slate-400 font-normal quote:text-slate-900 quote:dark:text-slate-200 quote:text-sm section:text-[15px]/5 quote:lg:text-base/6 blockquote:mr-8 blockquote:my-4 blockquote:ml-6 blockquote:before:-ml-4 blockquote:before:mr-2 blockquote:before:font-normal blockquote:before:content-['>'] blockquote:font-medium blockquote:text-sm text-sm lg:text-base ${highlightStyle} ${proseStyle} ${thinStyle}`}
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Paragraph;
