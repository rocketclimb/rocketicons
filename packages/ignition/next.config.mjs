import createMDX from "@next/mdx";
import { createCssVariablesTheme } from "shiki";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug-custom-id";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { shikiColorToClassTransform } from "@rocketclimb/code-block/shiki-transform";

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

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export", // Temporarily disabled for development
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = { fs: false, path: false };

    // Only apply optimizations in production builds
    if (!dev && !isServer) {
      // Aggressive code splitting for client bundles
      config.optimization.splitChunks = {
        chunks: "all",
        maxSize: 200000, // Reduced to 200KB chunks
        minSize: 20000, // Minimum 20KB chunks
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            maxSize: 200000,
            enforce: true
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            maxSize: 200000,
            priority: 5
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            maxSize: 200000
          }
        }
      };

      // Only set these in production to avoid conflicts with dev server
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },

  experimental: {
    // Disable optimizeCss in development to avoid critters dependency issues
    optimizeCss: process.env.NODE_ENV === "production",
    outputFileTracingIncludes: {
      "/[lang]/icons/[collectionid]/[iconid]": ["./src/app/data-helpers/svgs/svgs.db"]
    }
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
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

export default withBundleAnalyzer(withMDX(nextConfig));
