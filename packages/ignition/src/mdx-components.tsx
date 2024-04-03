import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const allComponentClasses = "mb-4";
  const titleClasses = `text-slate-900 dark:text-white font-semibold ${allComponentClasses}`;

  return {
    h1: ({ id, className, children }) => (
      <h1 id={id} className={`${className || ""} ${titleClasses}`}>
        {children}
      </h1>
    ),
    h2: ({ id, className, children }) => (
      <h2 id={id} className={`${className || ""} ${titleClasses}`}>
        {children}
      </h2>
    ),
    h3: ({ id, className, children }) => (
      <h3 id={id} className={`${className || ""} ${titleClasses}`}>
        {children}
      </h3>
    ),
    h4: ({ id, className, children }) => (
      <h4 id={id} className={`${className || ""} ${titleClasses}`}>
        {children}
      </h4>
    ),
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
    p: ({ className, children }) => (
      <p className={`${className || ""} ${allComponentClasses}`}>{children}</p>
    ),
    pre: ({ className, children }) => (
      <pre className={`${className || ""} ${allComponentClasses}`}>
        {children}
      </pre>
    ),
    a: ({ className, children, href }) => (
      <a
        className={`${className || ""} text-sky-500 hover:underline`}
        href={href}
      >
        {children}
      </a>
    ),
    ...components,
  };
}
