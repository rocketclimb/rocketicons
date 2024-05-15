import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Title4 = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="h4"
    defaultClassName="sub-title sub-section icon-info-area:mb-0.5 icon-info-area:text-[0.85rem] icon-info-area:xs:text-[0.9rem] icon-info-area:md:text-base text-base mt-0"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Title4;
