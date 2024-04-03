import {
  CommonText,
  TagName,
  CommonNotation,
  AttrValue,
} from "./code-elements";

type CodeImportBlockProps = {
  component: string;
  module: string;
  className?: string;
};

const CodeImportBlock = ({
  component,
  module,
  className,
}: CodeImportBlockProps) => (
  <CommonText
    lang="js"
    className={className || "text-sm"}
    onClick={() =>
      navigator.clipboard.writeText(`import { ${component} } from "${module}";`)
    }
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
);

export default CodeImportBlock;
