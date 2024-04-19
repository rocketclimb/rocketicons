import {
  Schema,
  defineCollection,
  defineConfig,
} from "@rocketclimb/content-collections";

import fs from "fs";
import envPath from "path";
import z from "zod";
import * as changeCase from "change-case";

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
  name: "pageComponents",
  directory: "src/app/locales/components",
  include: "**/*.mdx",
  schema: (z: any) => ({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
  }),
  transform: mdxTransformer,
  onBeforeSave: onBeforeSavePageComponentsCollection,
});

const docSchema = {
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  order: z.number(),
  group: z.string().optional(),
  activeSelector: z.string(),
};

const docs = defineCollection({
  name: "docs",
  directory: "src/app/locales/docs",
  include: "**/*.mdx",
  schema: (z: any) => docSchema,
  transform: mdxTransformer,
  onBeforeSave: onBeforeSaveDocsCollection,
});

export default defineConfig({
  collections: [components, docs],
});

async function onBeforeSavePageComponentsCollection(
  collection: any,
  collections: any,
  configuration: any
) {
  const docs = {} as any;
  const slugMap = {} as any;
  const docStructure = { docs, slugMap } as any;

  return onBeforeSaveCollectionCommon(
    "PageComponentIndex",
    collection,
    collections,
    configuration,
    docStructure
  );
}

async function onBeforeSaveDocsCollection(
  collection: any,
  collections: any,
  configuration: any
) {
  const config = await loadConfig();
  const docs = {} as any;
  const slugMap = {} as any;
  const docStructure = { config, docs, slugMap } as any;

  return onBeforeSaveCollectionCommon(
    "DocIndex",
    collection,
    collections,
    configuration,
    docStructure
  );
}

function onBeforeSaveCollectionCommon(
  typeName: string,
  collection: any,
  collections: any,
  configuration: any,
  docStructure: any
) {
  const dynamicStructure = {} as any;

  const configSchema = z.record(z.string(), z.record(z.string(), z.string()));
  const docSchema = z.record(
    z.string(),
    z.record(z.string(), z.record(z.string(), z.string()))
  );
  const slugMapSchema = z.record(z.string(), z.string());
  let indexSchema = {
    config: configSchema,
    docs: docSchema,
    slugMap: slugMapSchema,
  };

  (collection as any).documents.forEach(
    ({
      document: { enslug, locale, group, isComponent, _meta, ...data },
    }: any) => {
      if (data.slug != enslug) docStructure.slugMap[data.slug] = enslug;

      const docs = docStructure.docs;

      const getObject = () => {
        const key = isComponent ? group : enslug;
        docs[key] = docs[key] || {};
        docs[key][locale] = docs[key][locale] || { components: {} };

        return docs[key][locale];
      };

      const newDoc = { ...data, group, filePath: _meta.filePath };

      let doc = getObject();
      if (isComponent) {
        Object.assign(doc["components"], { [data.slug]: newDoc });
      } else {
        Object.assign(doc, newDoc);
      }

      // Generating dynamic json structure with N levels
      const path = _meta.directory.split(envPath.sep);
      const [fileName, fileLocale] = _meta.fileName.split(".");

      const pathArray = [fileLocale, ...path, fileName];

      generateRecursiveStructure()(
        enslug,
        fileLocale,
        pathArray,
        data,
        dynamicStructure
      );
    }
  );

  insertNewCollection(
    typeName,
    collection,
    docStructure,
    collections,
    configuration,
    indexSchema
  );

  // Dynamically generated json with N levels
  insertNewCollection(
    `Dynamic${typeName}`,
    collection,
    {
      docs: dynamicStructure,
      slugMap: docStructure.slugMap,
      config: docStructure.config,
    },
    collections,
    configuration
  );

  return collection;
}

function insertNewCollection(
  typeName: string,
  collection: any,
  document: any,
  collections: any,
  configuration: any,
  schema?: any
) {
  const newCollection = {
    name: changeCase.camelCase(typeName),
    notArray: true,
    typeName: typeName,
    schema: schema,
    parser: collection.parser,
    documents: [
      {
        document,
      },
    ],
  };

  if (collections.map((x: any) => x.name).indexOf(newCollection.name) === -1) {
    collections.push(newCollection);
  }
  if (
    configuration?.collections
      ?.map((x: any) => x.name)
      .indexOf(newCollection.name) === -1
  ) {
    configuration?.collections?.push(newCollection);
  }
}

function mdxTransformer(document: any): Schema<"frontmatter", any> {
  const dirElements = document._meta.directory.split("/");
  const pathElements = document._meta.path.split("/");
  const [enslug, locale] = pathElements.pop()!.split(".");

  const [group] = dirElements;
  const isComponent = dirElements.pop() === "components";

  return {
    ...document,
    // content: undefined,
    enslug,
    locale,
    group: document.group || group,
    isComponent,
  };
}

function generateRecursiveStructure() {
  return (
    slug: string,
    locale: string,
    path: string[],
    data: any,
    obj: any,
    parentObj?: any
  ) => {
    parentObj = parentObj || {};
    const [newKey, ...rest] = path;
    if (newKey) {
      if (!obj[newKey]) {
        if (parentObj[newKey]) {
          parentObj[newKey] = { ...data, ...parentObj[newKey] };
        } else {
          obj[newKey] = newKey === slug ? { ...data } : {};
        }
      }

      generateRecursiveStructure()(slug, locale, rest, data, obj[newKey], obj);
    }
  };
}
