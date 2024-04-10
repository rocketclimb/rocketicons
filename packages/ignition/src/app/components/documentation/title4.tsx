import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Title4 = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="h4"
    defaultClassName="sub-title sub-section text-base mt-2"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Title4;
