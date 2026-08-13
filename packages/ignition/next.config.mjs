import createMDX from "@next/mdx";
import { createCssVariablesTheme } from "shiki";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug-custom-id";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { shikiColorToClassTransform } from "@rocketclimb/code-block/shiki-transform";
import { IconsManifest } from "rocketicons/data";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

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
const siteUrl = process.env.SITE_ORIGIN ? new URL(process.env.SITE_ORIGIN) : undefined;
const siteBasePath = siteUrl?.pathname.replace(/\/+$/, "") ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: siteBasePath,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = { fs: false, path: false };

    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },

  experimental: {
    optimizeCss: process.env.NODE_ENV === "production",
    optimizePackageImports: packagesToOptimize
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },

  env: {
    NEXT_PUBLIC_SITE_BASE_PATH: siteBasePath
  }
};

export default withBundleAnalyzer(withMDX(nextConfig));
