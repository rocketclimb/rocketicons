import type { MDXComponents } from "mdx/types";
import {
  Title,
  Title2,
  Title3,
  Title4,
  Paragraph,
  Code,
  DocLink
} from "@/components/documentation";

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
    pre: ({ className, children }) => (
      <pre
        className={`rounded-lg p-3 bg-slate-900 ${
          className || ""
        } ${allComponentClasses}`}
      >
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <Code>{children}</Code>
    ),
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
    a: ({ href, children, ...props }) => (
      <DocLink
        external={href?.startsWith('http')}
        href={href||'#'}
        {...props}
      >
        {children}
      </DocLink>
    ),
    blockquote: ({ className, children }) => (
      <blockquote
        className={`rounded-lg p-3 text-2xl italic font-semibold border-s-4 border-gray-300 bg-slate-50 dark:bg-slate-800 default-text-color ${
          className || ""
        } ${allComponentClasses}`}
      >
        {children}
      </blockquote>
    ),
    ...components,
  };
}
