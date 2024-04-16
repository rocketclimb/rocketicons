import { PropsWithChildren } from "react";
import { DataElement, Attrs } from "./types";
import { getElementId, CodeEditState } from "./code-block-reducer";
import { CommonNotation, TagName, Attributes } from "./code-elements";

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
    <div className="count">
      <div>
        <CommonNotation lang="html">{adding}</CommonNotation>
        <TagName lang="html">
          {tagName === "ioLogoGithub" ? "IoLogoGithub" : tagName}
        </TagName>
        {attrs}
        <CommonNotation lang="html">
          {(children && ">") || " />"}
        </CommonNotation>
      </div>
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
  const Generator = ({
    nodes,
    parentId,
    deep,
    state,
    showId,
  }: CodeGenProps) => {
    deep = deep || 0;

    return (
      <div className="deep group-data-[variant=minimalist]/styler:pl-5">
        {nodes.map((node, i) => {
          if (typeof node === "string") {
            return (
              <span key={i} className="count text-white">
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
    <pre className="min-h-full">
      <code className="with-lines block text-wrap font-monospace py-4 group-data-[variant=minimalist]/styler:p-0 group-data-[variant=minimalist]/styler:-ml-7 group-data-[variant=minimalist]/styler:text-xs group-data-[variant=minimalist]/styler:md:text-sm text-sm leading-6 text-slate-50">
        <Generator {...props} />
        <div className="count"></div>
      </code>
    </pre>
  );
};

export default CodeGen;
