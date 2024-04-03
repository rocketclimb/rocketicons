import { TagName, CommonNotation, Attributes } from "./code-elements";

type CodeElementBlockProps = {
  component: string;
  className?: string;
  attrs?: Record<string, string>;
};

const CodeElementBlock = ({
  attrs,
  component,
  className,
}: CodeElementBlockProps) => (
  <CommonNotation
    lang="html"
    className={className || "text-sm"}
    onClick={() => navigator.clipboard.writeText(`<${component} />`)}
  >
    {"<"}
    <TagName lang="html">{component}</TagName>{" "}
    {attrs && <Attributes lang="html" attributes={attrs} />} {"/>"}
  </CommonNotation>
);

export default CodeElementBlock;
