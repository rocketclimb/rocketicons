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
    slug: z.string(),
    order: z.number(),
    activeSelector: z.string(),
  }),
  transform: async (document, context) => {
    const dirElements = document._meta.directory.split("/");
    const pathElements = document._meta.path.split("/");
    const fileNameElements = pathElements.pop()!.split(".");

    const enslug = fileNameElements[0];
    const locale = fileNameElements[1];
    const group = dirElements[0];
    const isComponent = dirElements[dirElements.length - 1] === "components";

    return {
      ...document,
      content: undefined,
      enslug,
      locale,
      group: group === enslug ? undefined : group,
      isComponent,
    };
  },
});

export default defineConfig({
  collections: [components, docs],
});
