import {
  Schema,
  defineCollection,
  defineConfig,
} from "@rocketclimb/content-collections";
import fs from "fs";

import { z } from "zod";

const localesFolder = "src/app/locales";

type Configuration = Record<string, string | Record<string, string>>;

const jsonConfigMapper = (
  filename: string,
  config: Record<string, Configuration>
) =>
  new Promise<void>((resolve, reject) => {
    fs.readFile(`${localesFolder}/${filename}`, (err, contents) => {
      if (err) {
        reject(err);
        return;
      }

      const lang = filename.replace(/.json$/i, "");
      const json = Object.entries(JSON.parse(contents.toString())) as [
        string,
        string
      ][];

      json.forEach(([key, data]) => {
        const value =
          typeof data === "string"
            ? data
            : Object.entries(data).reduce(
                (reduced, [key, value]) => ({ ...reduced, [key]: value }),
                {}
              );

        config[key] = config[key] || {};
        config[key][lang] = config[key][lang] || {};
        config[key][lang] = value;
      });

      resolve();
    });
  });

const loadConfig = async (): Promise<Record<string, Configuration>> => {
  const configFiles = fs
    .readdirSync(localesFolder)
    .filter((file) => /\.json$/i.test(file));

  const config = {};
  await Promise.all(configFiles.map((file) => jsonConfigMapper(file, config)));
  return config;
};

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
  onBeforeSave: async (collection, collections, configuration) => {
    let schema = {};

    const config = await loadConfig();
    const docs = {} as any;
    const slugMap = {} as any;
    const docStructure = { config, docs, slugMap } as any;

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
      name: "mdxIndex",
      notArray: true,
      documents: [
        {
          document: docStructure,
        },
      ],
    } as any);

    configuration?.collections?.push({
      name: "mdxIndex",
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

  return {
    ...document,
    content: undefined,
    enslug,
    locale,
    group: document.group || group,
    isComponent,
  };
}
