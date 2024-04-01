import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverMinification: false,
  },
};

export default withContentCollections(nextConfig);
