import CodeAnimator from "./code-animator";

import { Script, CodeStylerVariations, OnScriptCommit } from "./types";
import { PropsWithChildrenAndClassName } from "@/types";

export { ScriptActionType as ScriptAction } from "./types";

import element2Array from "./element-2-array";

type AnimatedCodeBlockProps = {
  script: Script;
  variants?: CodeStylerVariations;
  showCodeElementdId?: boolean;
  skipRender?: boolean;
  onCommit?: OnScriptCommit;
} & PropsWithChildrenAndClassName;

const AnimatedCodeBlock = ({
  script,
  children,
  skipRender,
  showCodeElementdId,
  variants,
  className,
  onCommit
}: AnimatedCodeBlockProps) => {
  const elements = element2Array(children);
  return (
    <CodeAnimator
      className={className}
      variants={variants}
      skipRender={skipRender}
      script={script}
      showCodeElementdId={showCodeElementdId}
      data={elements}
      onCommit={onCommit}
    >
      {children}
    </CodeAnimator>
  );
};

export default AnimatedCodeBlock;
