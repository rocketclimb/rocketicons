"use client";
import React, {
  PropsWithChildren,
  Children,
  ReactElement,
  cloneElement,
  useReducer,
} from "react";
import { DataChildren, DataElement, Script, Action, ElementId } from "./types";
import CodeGen from "./code-gen";

import { reducer, getElementId } from "./code-block-reducer";
import useScriptRunner from "./use-script-runner";

type CodeEditorProps = {
  script: Script;
  data: DataElement[];
  showCodeElementdId?: boolean;
} & PropsWithChildren;

const CodeEditor = ({
  script,
  children,
  data,
  showCodeElementdId,
}: CodeEditorProps) => {
  const [state, dispatch] = useReducer(reducer, {});

  type ElementPreviewData = DataElement | undefined;
  type ElementPreviewerProps = {
    child: ReactElement;
    props: any;
    id: string;
    data: ElementPreviewData;
  };

  const ElementPreviewer = ({
    child,
    props,
    id,
    data,
  }: ElementPreviewerProps) => {
    const { children, ...rest } = props;
    const codeClassName = data?.props?.className || "";
    const classNamePrefix = (props?.className || "")
      .replace(codeClassName, "")
      .trim();

    const getDataChildren = (
      index: number,
      children: DataChildren | DataChildren[]
    ): ElementPreviewData => {
      if (!children || typeof children === "string") {
        return;
      }
      return Array.isArray(children)
        ? getDataChildren(index, children[index])
        : children;
    };

    return (
      <>
        {cloneElement(
          child,
          {
            ...rest,
            className: `${classNamePrefix} ${
              state[id]?.elementState || codeClassName
            }`,
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

  const stateCurrent = (elementId: ElementId) =>
    state[elementId]?.codeState || "";

  const stateUpdate = (elementId: ElementId, updating: string) =>
    dispatch({ type: Action.UPDATE, id: elementId, updating });

  const stateCommit = (elementId: ElementId) =>
    dispatch({ type: Action.COMMIT, id: elementId });

  useScriptRunner(script, {
    update: stateUpdate,
    commit: stateCommit,
    current: stateCurrent,
  });

  return (
    <div>
      <div className="max-w-lg mx-auto mt-20 px-4 md:max-w-screen-md lg:max-w-7xl sm:px-6 md:px-8 sm:mt-24 lg:mt-32 lg:grid lg:gap-8 lg:grid-cols-12 lg:items-center">
        <div className="relative row-start-1 col-start-1 col-span-5 xl:col-span-6 -mt-10">
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
        <div className="relative row-start-1 col-start-6 xl:col-start-7 col-span-7 xl:col-span-6">
          <div className="-mx-4 sm:mx-0">
            <div className="relative overflow-hidden shadow-xl flex bg-slate-800 h-[31.625rem] max-h-[60vh] sm:max-h-[none] sm:rounded-xl lg:h-[34.6875rem] xl:h-[31.625rem] dark:bg-slate-900/70 dark:backdrop-blur dark:ring-1 dark:ring-inset dark:ring-white/10">
              <div className="relative w-full flex flex-col">
                <div className="flex-none border-b border-slate-500/30">
                  <div className="flex items-center h-8 space-x-1.5 px-3">
                    <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
                <div className="relative min-h-0 flex-auto flex flex-col dark">
                  <div className="w-full flex-auto flex min-h-0 overflow-auto">
                    <div className="w-full relative flex-auto">
                      <pre className="flex min-h-full text-sm leading-6">
                        <div className="hidden text-wrap whitespace-normal md:block text-slate-600 py-4 pr-4 text-right select-none pl-2 w-12">
                          1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21
                          22 23
                        </div>
                        <code className="flex-auto relative block text-slate-50 pt-4 pb-4 px-4 overflow-auto">
                          <CodeGen
                            nodes={data}
                            state={state}
                            showId={showCodeElementdId}
                          />
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
