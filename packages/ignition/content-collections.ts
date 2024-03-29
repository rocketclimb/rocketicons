import { defineCollection, defineConfig } from "@content-collections/core";

import { compileMDX } from "@content-collections/mdx";

const docs = defineCollection({
  name: "docs",
  directory: "src/app/locales",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document);
    return {
      ...document,
      body,
    };
  },
});

export default defineConfig({
  collections: [docs],
});
