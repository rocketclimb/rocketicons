import { serverEnv } from "@/env/server";
import { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"]
    },
    sitemap: `${serverEnv.NEXT_PUBLIC_APP_URL}/sitemap_index.xml`
  };
};

export default robots;
