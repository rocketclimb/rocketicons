import { Options, compileMDX } from "@content-collections/mdx";
import { defineCollection, defineConfig } from "@content-collections/core";

import rehypeShiki from "@shikijs/rehype";

const rehypeOptions = { theme: "one-dark-pro" };

const mdxOptions: Options = {
  rehypePlugins: [[rehypeShiki, rehypeOptions]],
};

const docs = defineCollection({
  name: "docs",
  directory: "src/app/locales",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
    description: z.string(),
    type: z.enum(["doc", "component"]),
    locale: z.enum(["en", "pt-br"]),
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
  collections: [docs],
});
