import { PropsWithChildren, ReactElement, Children } from "react";
import CodeAnimator from "./code-animator";

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

type AnimatedCodeBlockProps = {
  script: Script;
  showCodeElementdId?: boolean;
} & PropsWithChildren;

const AnimatedCodeBlock = ({
  script,
  children,
  showCodeElementdId,
}: AnimatedCodeBlockProps) => {
  const elements = element2Array(children);
  return (
    <CodeAnimator
      script={script}
      showCodeElementdId={showCodeElementdId}
      data={elements}
    >
      {children}
    </CodeAnimator>
  );
};

export default AnimatedCodeBlock;
