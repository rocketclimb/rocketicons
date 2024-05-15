import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Title = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="h1"
    defaultClassName="icons-hero:text-xl icons-hero:xs:text-2xl icons-hero:lg:text-3xl text-2xl md:text-4xl tracking-tight font-extrabold default-text-color"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Title;
