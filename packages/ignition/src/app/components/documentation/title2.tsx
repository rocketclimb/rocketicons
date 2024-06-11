import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Title2 = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="h2"
    defaultClassName="flex sub-title mb-0.5 text-xs xs:text-sm xs:leading-6 text-secondary tracking-normal dark:text-secondary-lighter"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Title2;
