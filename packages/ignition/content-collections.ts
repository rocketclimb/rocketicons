import { defineCollection, defineConfig } from "@content-collections/core";

const components = defineCollection({
  name: "components",
  directory: "src/app/locales/components",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    enslug: z.string(),
  }),
  transform: async (document) => {
    return transformer(document);
  },
});

const docs = defineCollection({
  name: "docs",
  directory: "src/app/locales/docs",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    order: z.number(),
    activeSelector: z.string(),
  }),
  transform: async (document) => {
    return transformer(document);
  },
});

export default defineConfig({
  collections: [components, docs],
});

function transformer(document: any) {
  const dirElements = document._meta.directory.split("/");
  const pathElements = document._meta.path.split("/");
  const [enslug, locale] = pathElements.pop()!.split(".");

  const [group] = dirElements;
  const isComponent = dirElements.pop() === "components";

  return {
    ...document,
    content: undefined,
    enslug,
    locale,
    group: group === enslug ? undefined : group,
    isComponent,
  };
}
