import createMDX from "@next/mdx";
import { createCssVariablesTheme } from "shiki";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug-custom-id";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { shikiColorToClassTransform } from "@rocketclimb/code-block/shiki-transform";
import { IconsManifest } from "rocketicons/data";

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
    optimizePackageImports: packagesToOptimize,
    outputFileTracingIncludes: {
      "/[lang]/icons/[collectionid]/[iconid]": ["./src/app/data-helpers/svgs/svgs.db"]
    }
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=31536000, must-revalidate"
          }
        ]
      }
    ];
  }
};

export default withMDX(nextConfig);
