import React from "react";
import { Attrs } from "./types";
import { PropsWithChildrenAndlassName } from "@/types";

const colors = {
  html: {
    "common-notation": "text-slate-100",
    "tag-name": "text-pink-400",
    "attr-name": "text-slate-300",
    "attr-value": "text-sky-300",
    "common-text": "text-slate-100",
  },
  js: {
    "common-notation": "text-slate-500",
    "tag-name": "text-pink-400",
    "attr-name": "text-slate-300",
    "attr-value": "text-sky-300",
    "common-text": "text-slate-50",
  },
};

type Lang = keyof typeof colors;
type Colors = typeof colors.html | typeof colors.js;
type ColorType = keyof Colors;

type CodeElementProps = {
  lang: Lang;
} & PropsWithChildrenAndlassName &
  React.SVGAttributes<HTMLElement>;

type RawSpanProps = React.SVGAttributes<HTMLElement> & {
  colors: Colors;
  codeType: ColorType;
} & PropsWithChildrenAndlassName;

const RawSpan = ({
  colors,
  codeType,
  children,
  className,
  ...props
}: RawSpanProps) => (
  <span
    className={`font-monospace ${colors[codeType]} ${className}`}
    {...props}
  >
    {children}
  </span>
);

export const AttrName = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan colors={colors[lang]} codeType="attr-name" {...props}>
    {children}
  </RawSpan>
);

export const AttrValue = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan colors={colors[lang]} codeType="attr-value" {...props}>
    {children}
  </RawSpan>
);

export const TagName = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan colors={colors[lang]} codeType="tag-name" {...props}>
    {children}
  </RawSpan>
);

export const CommonNotation = ({
  lang,
  children,
  ...props
}: CodeElementProps) => (
  <RawSpan colors={colors[lang]} codeType="common-notation" {...props}>
    {children}
  </RawSpan>
);

export const CommonText = ({ lang, children, ...props }: CodeElementProps) => (
  <RawSpan colors={colors[lang]} codeType="common-text" {...props}>
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
