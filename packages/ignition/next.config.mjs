import createMDX from "@next/mdx";
import { createCssVariablesTheme } from "shiki";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug-custom-id";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { createContentCollectionPlugin } from "@rocketclimb/content-collections";
import { IconsManifest } from "rocketicons/data";

const shikiColorToClassTransform = () => {
  let currentInfo = {
    meta: "",
    lang: "",
    code: ""
  };

  return {
    name: "rehype-custom-shiki:colors-to-class",
    code(node) {
      const colorToClass = (properties) => {
        const { style } = properties;
        const [, color] = /color:var\(--shiki-(.*)\)/.exec(style);
        if (color) {
          properties.class = `rc-cb-${color}`;
          delete properties.style;
        }
      };
      const replaceAllColors = (children) => {
        children.forEach(({ children, properties }) => {
          properties && properties.style && colorToClass(properties);
          children && replaceAllColors(children);
        });
      };
      replaceAllColors(node.children);
      node.properties["data-clipboardText"] = Buffer.from(currentInfo.code).toString("base64");
      return node;
    },
    pre(pre) {
      const meta = currentInfo.meta
        .split(" ")
        .filter((meta) => !!meta)
        .map((raw) => {
          const [key, value] = raw.split("=");
          return { key, value: value.replace(/"|'/g, "") };
        });
      meta?.forEach(({ key, value }) => {
        pre.properties[`data-${key}`] = value;
      });
      pre.properties["data-lang"] = currentInfo.lang;
      return pre;
    },
    preprocess(code, { meta: { __raw: meta }, lang }) {
      currentInfo = {
        meta,
        lang,
        code
      };
      return code;
    }
  };
};

const theme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--shiki-",
  variableDefaults: {},
  fontStyle: true
});

const shikiOptions = {
  theme,
  transformers: [shikiColorToClassTransform()]
};
const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    rehypePlugins: [
      [rehypeShiki, shikiOptions],
      [rehypeSlug, { fragment: true, removeAccents: true }]
    ]
  }
});

const packagesToOptimize = IconsManifest.map(({ id }) => `rocketicons/${id}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },

  experimental: {
    optimizePackageImports: packagesToOptimize
  }
};

const withContentCollections = createContentCollectionPlugin({
  skipWatcher: true
});

export default withContentCollections(withMDX(nextConfig));
