import { PropsWithChildren } from "react";
import { DataChildren, DataElement } from "./types";
import { getElementId, CodeEditState } from "./code-block-reducer";

type Attrs = Record<string, string>;

type AttrsProps = {
  attributes: Attrs;
};

const Attrs = ({ attributes }: AttrsProps) => (
  <>
    {Object.entries(attributes)
      .filter(([, value]) => !!value)
      .map(([name, value], i) => (
        <div key={i} className="inline-block">
          <span className="ml-1 text-slate-300">{name}=</span>
          <span className="text-sky-300">{`"${value}"`}</span>
        </div>
      ))}
  </>
);

type TagProps = {
  tagName: string;
  attributes?: Attrs;
} & PropsWithChildren;

const Tag = ({ tagName, attributes, children }: TagProps) => {
  type ShowTagProps = {
    adding: string;
    attrs?: JSX.Element;
  };

  const ShowTag = ({ adding, attrs }: ShowTagProps) => (
    <div>
      <span className="text-slate-100">{adding}</span>
      <span className="text-pink-400">
        {tagName === "ioLogoGithub" ? "IoLogoGithub" : tagName}
      </span>
      {attrs}
      <span className="text-slate-100">{(children && ">") || " />"}</span>
    </div>
  );

  return (
    <>
      <ShowTag
        adding="<"
        attrs={<Attrs attributes={attributes || {}} />}
      ></ShowTag>
      {(children && (
        <>
          {children}
          <ShowTag adding="</" />
        </>
      )) || <></>}
    </>
  );
};

type ChildrenWrapperProps = {
  data: DataChildren[];
  elementId: string;
};

type CodeGenProps = {
  nodes: (string | DataElement)[];
  parentId?: string;
  deep?: number;
  state: CodeEditState;
  showId?: boolean;
};

const CodeGen = ({ nodes, parentId, deep, state, showId }: CodeGenProps) => {
  deep = deep || 0;
  return (
    <div>
      {nodes.map((node, i) => {
        if (typeof node === "string") {
          return (
            <span key={i} className="text-white ml-3">
              {node}
            </span>
          );
        }

        const { tag, props, children } = node;
        return (
          <div key={i} style={{ marginLeft: `${10 * deep!}px` }}>
            <Tag
              tagName={tag}
              attributes={{
                ...props,
                ...((showId && { ["data-id"]: getElementId(i, parentId) }) ||
                  {}),
                className:
                  state[getElementId(i, parentId)]?.codeState ||
                  props.className,
              }}
            >
              {children && (
                <CodeGen
                  nodes={
                    (Array.isArray(children)
                      ? children
                      : [children]) as DataElement[]
                  }
                  deep={deep! + 1}
                  state={state}
                  parentId={getElementId(i, parentId)}
                  showId={showId}
                />
              )}
            </Tag>
          </div>
        );
      })}
    </div>
  );
};

export default CodeGen;
