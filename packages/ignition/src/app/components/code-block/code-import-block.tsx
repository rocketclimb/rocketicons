import { Languages, PropsWithClassName } from "@/types";
import { CommonText, TagName, CommonNotation, AttrValue } from "./code-elements";
import WithCopy from "./with-copy";

type CodeImportBlockProps = {
  locale: Languages;
  component: string;
  module: string;
} & PropsWithClassName;

const CodeImportBlock = ({ locale, component, module, className }: CodeImportBlockProps) => (
  <WithCopy lang={locale} clipboardText={`import { ${component} } from "${module}";`}>
    <CommonText
      lang="js"
      className={className || "text-sm"}
      onClick={() => navigator.clipboard.writeText(`import { ${component} } from "${module}";`)}
    >
      import <CommonNotation lang="js">{`{`}</CommonNotation>
      <TagName lang="js" className="mx-1">
        {component}
      </TagName>
      <CommonNotation lang="js">{`}`}</CommonNotation>
      <span className="mx-1">from</span>
      <AttrValue lang="js">{`"${module}"`}</AttrValue>
      <CommonNotation lang="js">;</CommonNotation>
    </CommonText>
  </WithCopy>
);

export default CodeImportBlock;
