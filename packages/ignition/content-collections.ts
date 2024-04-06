import {
  AnyCollection,
  Collection,
  Schema,
  defineCollection,
  defineConfig,
} from "@rocketclimb/content-collections";
import envPath from "path";

import { z } from "zod";

const components = defineCollection({
  name: "components",
  directory: "src/app/locales/components",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
  }),
  transform: transformer,
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
    group: z.string().optional(),
    activeSelector: z.string(),
  }),
  transform: transformer,
  onBeforeSave: (collection, collections, configuration) => {
    // console.log("onBeforeSave", collection);

    let schema = {};

    const docs = {} as any;
    const slugMap = {} as any;
    const docStructure = { docs, slugMap } as any;

    (collection as any).documents.forEach(
      ({
        document: { enslug, locale, group, isComponent, _meta, ...data },
      }: any) => {
        // const path = _meta.path.split(envPath.sep);
        // const fileLocale = path[path.length - 1]!.split(".")[1];

        // console.log("path", _meta.path);

        // const recursiveFunction = (obj: any, path: string[]): any => {
        //   console.log("recursiveFunction", obj, path);

        //   if (path.length === 0) {
        //     return obj || {};
        //   }

        //   const [newKey, ...rest] = path;

        //   console.log("newKey", newKey);
        //   console.log("rest", rest);

        //   if (!obj[newKey]) {
        //     obj[newKey] = {};
        //   }

        //   return recursiveFunction(obj[newKey], rest);
        // };

        // recursiveFunction(doc, path);

        if (data.slug != enslug) slugMap[data.slug] = enslug;

        const getObject = () => {
          const key = isComponent ? group : enslug;
          docs[key] = docs[key] || {};
          docs[key][locale] = docs[key][locale] || { components: {} };

          return docs[key][locale];
        };

        let doc = getObject();
        if (isComponent) {
          Object.assign(doc["components"], { [data.slug]: data });
        } else {
          Object.assign(doc, data);
        }
      }
    );

    collections.push({
      name: "mdxindex",
      notArray: true,
      documents: [
        {
          document: docStructure,
        },
      ],
    } as any);

    configuration?.collections?.push({
      name: "mdxindex",
      directory: "",
      include: "",
      schema,
      typeName: "MdxIndex",
      parser: "frontmatter",
    });

    return collection;
  },
});

export default defineConfig({
  collections: [components, docs],
});

function transformer(document: any): Schema<"frontmatter", any> {
  const dirElements = document._meta.directory.split("/");
  const pathElements = document._meta.path.split("/");
  const [enslug, locale] = pathElements.pop()!.split(".");

  const [group] = dirElements;
  const isComponent = dirElements.pop() === "components";

  if (enslug === "colors-selector") {
    console.log(document);
  }

  return {
    ...document,
    content: undefined,
    enslug,
    locale,
    group: document.group || group,
    isComponent,
  };
}
