import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Title3 = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="h3"
    defaultClassName="sub-title sub-section flex xs:text-lg mb-3"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Title3;
