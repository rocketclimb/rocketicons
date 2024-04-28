import createMDX from "@next/mdx";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug-custom-id";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { createContentCollectionPlugin } from "@rocketclimb/content-collections";

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

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  experimental: {
    optimizePackageImports: [
      "rocketicons/ai",
      "rocketicons/bi",
      "rocketicons/bs",
      "rocketicons/cg",
      "rocketicons/ci",
      "rocketicons/di",
      "rocketicons/fa",
      "rocketicons/fa6",
      "rocketicons/fc",
      "rocketicons/fi",
      "rocketicons/gi",
      "rocketicons/go",
      "rocketicons/gr",
      "rocketicons/hi",
      "rocketicons/hi2",
      "rocketicons/im",
      "rocketicons/io",
      "rocketicons/io5",
      "rocketicons/lia",
      "rocketicons/lu",
      "rocketicons/md",
      "rocketicons/pi",
      "rocketicons/rc",
      "rocketicons/ri",
      "rocketicons/rx",
      "rocketicons/si",
      "rocketicons/sl",
      "rocketicons/tb",
      "rocketicons/tfi",
      "rocketicons/ti",
      "rocketicons/vsc",
      "rocketicons/wi"
    ]
  }
};

const withContentCollections = createContentCollectionPlugin({
  skipWatcher: true
});

export default withContentCollections(withMDX(nextConfig));
