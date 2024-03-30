import { Options, compileMDX } from "@content-collections/mdx";
import { defineCollection, defineConfig } from "@content-collections/core";

import rehypeShiki from "@shikijs/rehype";

const rehypeOptions = { theme: "one-dark-pro" };

const mdxOptions: Options = {
  rehypePlugins: [[rehypeShiki, rehypeOptions]],
};

const components = defineCollection({
  name: "components",
  directory: "src/app/locales/components",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    locale: z.enum(["en", "pt-br"]),
    slug: z.string(),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document, mdxOptions);
    return {
      ...document,
      body,
    };
  },
});

const docs = defineCollection({
  name: "docs",
  directory: "src/app/locales/docs",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    locale: z.enum(["en", "pt-br"]),
    slug: z.string(),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document, mdxOptions);
    return {
      ...document,
      body,
    };
  },
});

export default defineConfig({
  collections: [components, docs],
});
