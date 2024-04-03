import { PropsWithChildren, useEffect, useState } from "react";
import { DataElement, Attrs } from "./types";
import { getElementId, CodeEditState } from "./code-block-reducer";
import { CommonNotation, TagName, Attributes } from "./code-elements";

const getLinesCount = (nodes: (string | DataElement)[]): number =>
  nodes.reduce((reduced, node) => {
    if (typeof node === "string" || !node.children) {
      return reduced + 1;
    }
    const children: DataElement[] = (
      Array.isArray(node.children) ? node.children : [node.children]
    ) as DataElement[];
    return reduced + 2 + getLinesCount(children);
  }, 0);

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
      <CommonNotation lang="html">{adding}</CommonNotation>
      <TagName lang="html">
        {tagName === "ioLogoGithub" ? "IoLogoGithub" : tagName}
      </TagName>
      {attrs}
      <CommonNotation lang="html">{(children && ">") || " />"}</CommonNotation>
    </div>
  );

  return (
    <>
      <ShowTag
        adding="<"
        attrs={<Attributes lang="html" attributes={attributes || {}} />}
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

type CodeGenProps = {
  nodes: (string | DataElement)[];
  parentId?: string;
  deep?: number;
  state: CodeEditState;
  showId?: boolean;
};

const CodeGen = (props: CodeGenProps) => {
  const [lines, setLines] = useState<number>(0);

  useEffect(() => {
    setLines(getLinesCount(props.nodes));
  }, []);

  const Generator = ({
    nodes,
    parentId,
    deep,
    state,
    showId,
  }: CodeGenProps) => {
    deep = deep || 0;

    return (
      <div className={`${(deep && "pl-5") || "p-0"}`}>
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
            <div key={i}>
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
                  <Generator
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
  return (
    <pre className="flex min-h-full">
      <div className="hidden text-wrap font-monospace text-sm leading-6 whitespace-normal md:block text-slate-600 py-4 pr-4 text-right select-none pl-2 w-12">
        {Array.from({ length: lines + 2 }, (_, i) => i + 1).map((i) => `${i} `)}
      </div>
      <code className="flex-auto relative block font-monospace text-sm leading-6 text-slate-50 pt-4 pb-4 px-2 overflow-auto">
        <Generator {...props} />
      </code>
    </pre>
  );
};

export default CodeGen;
