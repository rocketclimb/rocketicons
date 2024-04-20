"use client";
import { PropsWithChildren, useReducer } from "react";
import CodeStyler from "./code-styler";
import element2Array from "./element-2-array";
import CodeGen from "./code-gen";
import { reducer } from "./code-block-reducer";

const CodeSample = ({ children }: PropsWithChildren) => {
  const [state] = useReducer(reducer, {});
  const elements = element2Array(children);

  return (
    <CodeStyler animatedPreviewer={false} variant={"minimalist"}>
      <CodeGen nodes={elements} state={state} />
    </CodeStyler>
  );
};

export default CodeSample;
