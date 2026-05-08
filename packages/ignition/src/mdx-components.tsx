import { HtmlHTMLAttributes, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import Title from "@/components/documentation/title";
import Title2 from "@/components/documentation/title2";
import Title3 from "@/components/documentation/title3";
import Title4 from "@/components/documentation/title4";
import Title5 from "@/components/documentation/title5";
import Paragraph from "@/components/documentation/paragraph";
import { Lang, WithCopy, CodeStyler, Block, TabContent } from "@rocketclimb/code-block";

import DocLink from "@/components/documentation/doc-link";

type PreProps = HtmlHTMLAttributes<HTMLPreElement> & {
  "data-filename"?: string;
  "data-lang"?: Lang;
  "data-tabs"?: string;
};

type CodeProps = HtmlHTMLAttributes<HTMLPreElement> & {
  "data-clipboard-text"?: string;
  "data-tab-name"?: string;
};

const CodeContainer = ({
  "data-clipboard-text": clipboardText,
  "data-tab-name": name,
  children
}: CodeProps) => {
  children = (!!clipboardText && (
    <WithCopy clipboardText={Buffer.from(clipboardText, "base64").toString()}>
      {children as any}
    </WithCopy>
  )) || <>{children}</>;
  return (!!name && <TabContent tabName={name}>{children as any}</TabContent>) || <>{children}</>;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const allComponentClasses = "mb-4";
  const titleClasses = `text-primary dark:primary-dark font-semibold ${allComponentClasses}`;

  return {
    h1: ({ children, ...props }: any) => <Title {...props}>{children as ReactNode}</Title>,
    h2: ({ children, ...props }: any) => <Title2 {...props}>{children as ReactNode}</Title2>,
    h3: ({ children, ...props }: any) => <Title3 {...props}>{children as ReactNode}</Title3>,
    h4: ({ children, ...props }: any) => <Title4 {...props}>{children as ReactNode}</Title4>,
    h5: ({ children, ...props }: any) => <Title5 {...props}>{children as ReactNode}</Title5>,
    h6: ({ id, className, children }) => (
      <h6 id={id} className={`${className || ""} ${titleClasses}`}>
        {children}
      </h6>
    ),
    p: ({ children, ...props }: any) => <Paragraph {...props}>{children as ReactNode}</Paragraph>,
    pre: (({
      className,
      children,
      "data-filename": filename,
      "data-lang": lang,
      "data-tabs": tabs,
      ...props
    }: PreProps) => (
      <div className="my-3">
        <CodeStyler
          {...props}
          lang={lang}
          filename={lang === "bash" ? "terminal" : filename ?? ""}
          className={`pre ${className}`}
          tabs={tabs?.split(" ") as string[]}
          variant="minimalist"
        >
          {children as any}
        </CodeStyler>
      </div>
    )) as any,
    code: (({ children, ...props }: CodeProps) => (
      <CodeContainer {...props}>
        <Block>{children as any}</Block>
      </CodeContainer>
    )) as any,
    ul: ({ className, children }) => (
      <ul
        className={`list-disc list-inside default-text-color ${
          className ?? ""
        } ${allComponentClasses}`}
      >
        {children}
      </ul>
    ),
    ol: ({ className, children }) => (
      <ol
        className={`list-decimal list-inside default-text-color ${
          className ?? ""
        } ${allComponentClasses}`}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li {...props} className="text-sm lg:text-base">
        {children}
      </li>
    ),
    a: ({ href, children, ...props }: any) => (
      <DocLink external={href?.startsWith("http")} href={href ?? "#"} {...(props as any)}>
        {children as ReactNode}
      </DocLink>
    ),
    blockquote: ({ children, ...props }: any) => <blockquote {...props}>{children}</blockquote>,
    ...components
  };
}
