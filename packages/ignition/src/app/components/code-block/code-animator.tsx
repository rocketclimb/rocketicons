"use client";
import React, { Children, ReactElement, cloneElement, useReducer } from "react";
import {
  DataChildren,
  DataElement,
  Script,
  Action,
  ElementId,
  CodeStylerVariations,
  OnScriptCommit
} from "./types";
import CodeGen from "./code-gen";
import CodeStyler from "./code-styler";

import { reducer, getElementId } from "./code-block-reducer";
import useScriptRunner from "./use-script-runner";
import { PropsWithChildrenAndClassName } from "@/types";

type CodeAnimatorProps = {
  script: Script;
  data: DataElement[];
  showCodeElementdId?: boolean;
  skipRender?: boolean;
  variants?: CodeStylerVariations;
  onCommit?: OnScriptCommit;
} & PropsWithChildrenAndClassName;

const CodeAnimator = ({
  script,
  children,
  data,
  showCodeElementdId,
  skipRender,
  variants,
  className,
  onCommit
}: CodeAnimatorProps) => {
  const [state, dispatch] = useReducer(reducer, {});

  type ElementPreviewData = DataElement | undefined;
  type ElementPreviewerProps = {
    child: ReactElement;
    props: any;
    id: string;
    data: ElementPreviewData;
  };

  const ElementPreviewer = ({ child, props, id, data }: ElementPreviewerProps) => {
    const { children, ...rest } = props;
    const codeClassName = data?.props?.className || "";
    const classNamePrefix = (props?.className || "").replace(codeClassName, "").trim();

    const getDataChildren = (
      index: number,
      children: DataChildren | DataChildren[]
    ): ElementPreviewData => {
      if (!children || typeof children === "string") {
        return;
      }
      return Array.isArray(children) ? getDataChildren(index, children[index]) : children;
    };

    return (
      <>
        {cloneElement(
          child,
          {
            ...rest,
            className: `${classNamePrefix} ${state[id]?.elementState || codeClassName}`
          },
          ((Array.isArray(children) && children) || [children]).map(
            (child: string | undefined | object, key) =>
              typeof child === "object" ? (
                <ElementPreviewer
                  key={key}
                  child={child as ReactElement}
                  props={(child as ReactElement)?.props}
                  id={getElementId(key, id)}
                  data={getDataChildren(key, data?.children)}
                />
              ) : (
                child
              )
          )
        )}
      </>
    );
  };

  const stateCurrent = (elementId: ElementId) => state[elementId]?.codeState || "";

  const stateUpdate = (elementId: ElementId, updating: string) =>
    dispatch({ type: Action.UPDATE, id: elementId, updating });

  const stateCommit = (elementId: ElementId, current: string | undefined) => {
    onCommit && onCommit(elementId, current);
    dispatch({ type: Action.COMMIT, id: elementId });
  };

  useScriptRunner(script, {
    update: stateUpdate,
    commit: stateCommit,
    current: stateCurrent
  });

  return (
    <div>
      <div
        data-previewer={!skipRender}
        className={
          !skipRender
            ? `w-full mx-auto max-w-3xl mt-20 lg:max-w-7xl lg:grid lg:gap-6 lg:items-center lg:grid-cols-12 ${
                className ?? ""
              }`
            : ""
        }
      >
        {!skipRender && (
          <div className="row-start-1 col-start-1 lg:col-span-5">
            <div className="transition-all bg-white rounded-lg overflow-hidden ring-1 ring-slate-900/5 dark:bg-slate-800 dark:highlight-white/5 dark:ring-0 flex mb-4">
              {Children.map(children as ReactElement[], (child, i) => {
                const { props } = child;
                return (
                  <ElementPreviewer
                    key={i}
                    child={child}
                    props={props}
                    id={getElementId(i)}
                    data={data[i]}
                  />
                );
              })}
            </div>
          </div>
        )}
        <CodeStyler
          className={(skipRender && className) || "lg:col-span-7"}
          animatedPreviewer={!skipRender}
          variant={variants}
        >
          <CodeGen nodes={data} state={state} showId={showCodeElementdId} />
        </CodeStyler>
      </div>
    </div>
  );
};

export default CodeAnimator;
