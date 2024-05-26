import BaseDocElement, { DocElementProps } from "./base-doc-element";

const highlightStyle = `
  highlight:text-base highlight:lg:text-lg highlight:my-5
  highlight:tracking-tight highlight:min-[714px]:mb-12
  highlight:md:tracking-normal highlight:md:mb-10 highlight:min-[1218px]:mb-5
`;

const proseStyle = `
  prose:text-sm prose:tracking-tight prose:mb-2
`;

const thinStyle = `
  thin:my-1.5 thin:text-xs thin:xs:text-[0.83rem] thin:md:text-[0.93rem]
`;

const quoteStyle = `
  quote:text-primary quote:dark:text-primary-dark quote:text-sm quote:lg:text-base/6
`;

const blockquoteStyle = `
  blockquote:mr-8 blockquote:my-4 blockquote:ml-6 blockquote:before:-ml-4
  blockquote:before:mr-2 blockquote:before:font-normal blockquote:before:content-['>']
  blockquote:xs:font-medium blockquote:text-xs blockquote:xs:text-sm blockquote:italic
  blockquote:xs:not-italic
`;

const sectionStyle = `
  section:text-xs section:xs:text-[0.83rem]/normal section:md:text-[0.9rem]/normal  section:hidden section:first-of-type:block section:last-of-type:xs:-mt-0.5  section:first-of-type:xs:inline-block section:xs:block section:xs:inline-block section:xs:whitespace-normal
`;

const tabSectionStyle = `
  tab-section:hidden tab-section:xs:inline-block tab-section:text-xs tab-section:xs:text-xs/relaxed tab-section:md:text-[0.85rem]/relaxed tab-section:xs:ml-1.5 tab-section:xs:mx-1.5 tab-section:first:block tab-section:xs:first:hidden tab-section:text-clip tab-section:whitespace-nowrap tab-section:xs:whitespace-normal
`;

const heroStyle = `
  hero:mt-4 hero:xs:mt-6 hero:xs:px-3 hero:text-sm hero:xs:text-base hero:md:text-lg hero:text-primary-medium hero:text-center hero:max-w-3xl mx-auto
`;

const iconsHeroStyle = `
  icons-hero:mt-4 icons-hero:text-[0.71rem] icons-hero:leading-4 icons-hero:my-2 icons-hero:xs:text-sm icons-hero:xs:leading-5 icons-hero:lg:text-base icons-hero:lg:leading-6
`;

const iconsInfoBoxStyle = `
  icon-info-area:tracking-tighter
`;

const Paragraph = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="p"
    defaultClassName={`group/p paragraph text-primary/70 dark:text-primary-lighter font-normal text-sm leading-6 after-p:mt-2 lg:text-base ${heroStyle} ${sectionStyle} ${blockquoteStyle} ${quoteStyle} ${highlightStyle} ${proseStyle} ${thinStyle} ${iconsHeroStyle} ${iconsInfoBoxStyle} ${tabSectionStyle}`}
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Paragraph;
