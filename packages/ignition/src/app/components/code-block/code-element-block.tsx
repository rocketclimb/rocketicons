import { PropsWithClassName } from "@/types";
import { TagName, CommonNotation, Attributes } from "./code-elements";
import WithCopy from "./with-copy";

const attributesAsText = (attrs?: Record<string, string>) =>
  attrs
    ? Object.entries(attrs)
        .filter(([, value]) => !!value)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
    : "";

type CodeElementBlockProps = {
  component: string;
  attrs?: Record<string, string>;
} & PropsWithClassName;

const CodeElementBlock = ({
  attrs,
  component,
  className,
}: CodeElementBlockProps) => {
  return (
    <WithCopy clipboardText={`<${component}  ${attributesAsText(attrs)} />`}>
      <CommonNotation lang="html" className={className || "text-sm"}>
        {"<"}
        <TagName lang="html">{component}</TagName>{" "}
        {attrs && <Attributes lang="html" attributes={attrs} />} {"/>"}
      </CommonNotation>
    </WithCopy>
  );
};

export default CodeElementBlock;
