import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Title5 = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="h5"
    defaultClassName="sub-title sub-section icon-info-area:mb-0.5 icon-info-area:text-[0.8rem]/normal icon-info-area:xs:text-[0.9rem] icon-info-area:md:text-base text-base mt-0"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Title5;
