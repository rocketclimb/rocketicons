import type { MDXComponents } from "mdx/types";
import Title from "@/components/documentation/title";
import Title2 from "@/components/documentation/title2";
import Title3 from "@/components/documentation/title3";
import Title4 from "@/components/documentation/title4";
import Paragraph from "@/components/documentation/paragraph";
import Code from "@/components/documentation/code";
import CodeStyler from "@/components/code-block/code-styler";
import DocLink from "@/components/documentation/doc-link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const allComponentClasses = "mb-4";
  const titleClasses = `text-slate-900 dark:text-white font-semibold ${allComponentClasses}`;

  return {
    h1: ({ children, ...props }) => <Title {...props}>{children}</Title>,
    h2: ({ children, ...props }) => <Title2 {...props}>{children}</Title2>,
    h3: ({ children, ...props }) => <Title3 {...props}>{children}</Title3>,
    h4: ({ children, ...props }) => <Title4 {...props}>{children}</Title4>,
    h5: ({ id, className, children }) => (
      <h5 id={id} className={`${className || ""} ${titleClasses}`}>
        {children}
      </h5>
    ),
    h6: ({ id, className, children }) => (
      <h6 id={id} className={`${className || ""} ${titleClasses}`}>
        {children}
      </h6>
    ),
    p: ({ children, ...props }) => <Paragraph {...props}>{children}</Paragraph>,
    pre: ({ className, children, ...props }) => (
      <div className="my-3">
        <CodeStyler
          {...props}
          className={`pre ${className}`}
          variant="minimalist"
        >
          {children}
        </CodeStyler>
      </div>
    ),
    code: ({ children }) => <Code>{children}</Code>,
    ul: ({ className, children }) => (
      <ul
        className={`list-disc list-inside default-text-color ${
          className || ""
        } ${allComponentClasses}`}
      >
        {children}
      </ul>
    ),
    ol: ({ className, children }) => (
      <ol
        className={`list-decimal list-inside default-text-color ${
          className || ""
        } ${allComponentClasses}`}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li {...props} className="text-sm lg:text-base">
        {children}
      </li>
    ),
    a: ({ href, children, ...props }) => (
      <DocLink
        external={href?.startsWith("http")}
        href={href || "#"}
        {...props}
      >
        {children}
      </DocLink>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote {...props}>{children}</blockquote>
    ),
    ...components,
  };
}
