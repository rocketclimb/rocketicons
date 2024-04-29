import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Title = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="h1"
    defaultClassName="text-3xl md:text-4xl tracking-tight font-extrabold default-text-color"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Title;
