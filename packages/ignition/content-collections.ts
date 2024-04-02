import { defineCollection, defineConfig } from "@content-collections/core";

const components = defineCollection({
  name: "components",
  directory: "src/app/locales/components",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    locale: z.enum(["en", "pt-br"]),
    slug: z.string(),
    enslug: z.string(),
  }),
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
    enslug: z.string(),
    group: z.string().optional(),
    order: z.number(),
    hide: z.boolean().optional(),
    activeSelector: z.string(),
  }),
});

export default defineConfig({
  collections: [components, docs],
});
