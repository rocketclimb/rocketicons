import { PropsWithChildren, ReactElement, Children } from "react";
import CodeEditor from "./code-editor";

import { DataElement, DataChildren, Script } from "./types";

export { ScriptActionType as ScriptAction } from "./types";

const typeToTagName = (type: string | Function): string =>
  typeof type === "function" ? (type as Function).name : type;

const nodeMap = ({ type, props }: ReactElement): DataElement => {
  const { children, ...rest } = props || {};

  const mapChildren = (
    child: string | undefined | ReactElement
  ): DataChildren => (typeof child === "object" ? nodeMap(child) : child);

  return {
    tag: typeToTagName(type),
    props: rest,
    children: Array.isArray(children)
      ? children.map(mapChildren)
      : mapChildren(children),
  };
};

const element2Array = (nodes: any): DataElement[] =>
  (Children.toArray(nodes) as ReactElement[])
    .filter(({ type }) => !!type)
    .map(nodeMap);

type CodeBlockProps = {
  script: Script;
  showCodeElementdId?: boolean;
} & PropsWithChildren;

const CodeBlock = ({
  script,
  children,
  showCodeElementdId,
}: CodeBlockProps) => {
  const elements = element2Array(children);
  return (
    <CodeEditor
      script={script}
      showCodeElementdId={showCodeElementdId}
      data={elements}
    >
      {children}
    </CodeEditor>
  );
};

export default CodeBlock;
