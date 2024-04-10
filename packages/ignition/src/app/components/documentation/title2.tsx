import BaseDocElement, { DocElementProps } from "./base-doc-element";

const Title2 = ({ children, ...props }: DocElementProps) => (
  <BaseDocElement
    Tag="h2"
    defaultClassName="flex sub-title mb-2 text-sm leading-6 text-sky-500 tracking-normal dark:text-sky-400"
    {...props}
  >
    {children}
  </BaseDocElement>
);

export default Title2;
