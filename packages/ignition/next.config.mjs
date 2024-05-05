import createMDX from "@next/mdx";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug-custom-id";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { createContentCollectionPlugin } from "@rocketclimb/content-collections";
import { IconsManifest } from "rocketicons/data";

const shikiOptions = {
  themes: {
    light: "dracula",
    dark: "dracula"
  }
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

  experimental: {
    optimizePackageImports: packagesToOptimize
  }
};

const withContentCollections = createContentCollectionPlugin({
  skipWatcher: true
});

export default withContentCollections(withMDX(nextConfig));
