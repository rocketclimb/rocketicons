import React from "react";
import { Attrs } from "./types";
import { PropsWithChildrenAndClassName } from "@/types";
import { Lang, CodeType, getLanguageClass, getCodeTypeClass } from "./utils";

type CodeElementProps = {
  lang: Lang;
} & PropsWithChildrenAndClassName &
  React.SVGAttributes<HTMLElement>;

type RawSpanProps = React.SVGAttributes<HTMLElement> & {
  lang: Lang;
  codeType: CodeType;
} & PropsWithChildrenAndClassName;

const RawSpan = ({ lang, codeType, children, className, ...props }: RawSpanProps) => (
  <span
    className={`font-monospace ${getLanguageClass(lang)} ${getCodeTypeClass(codeType)} ${className ?? ""}`}
    {...props}
  >
    {children}
  </span>
);

export const AttrName = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan lang={lang} codeType="attr-name" {...props}>
    {children}
  </RawSpan>
);

export const AttrValue = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan lang={lang} codeType="attr-value" {...props}>
    {children}
  </RawSpan>
);

export const TagName = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan lang={lang} codeType="tag-name" {...props}>
    {children}
  </RawSpan>
);

export const CommonNotation = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan lang={lang} codeType="common-notation" {...props}>
    {children}
  </RawSpan>
);

export const CommonText = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan lang={lang} codeType="common-text" {...props}>
    {children}
  </RawSpan>
);

type AttrsProps = {
  lang: Lang;
  attributes: Attrs;
};

export const Attributes = ({ lang, attributes }: AttrsProps) => (
  <>
    {Object.entries(attributes)
      .filter(([, value]) => !!value)
      .map(([name, value], i) => (
        <div key={i} className="inline-block">
          <AttrName lang={lang} className="ml-1">
            {name}=
          </AttrName>
          <AttrValue lang={lang}>{`"${value}"`}</AttrValue>
        </div>
      ))}
  </>
);
