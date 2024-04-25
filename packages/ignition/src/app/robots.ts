import { serverEnv } from "@/env/server";
import { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/"
    },
    sitemap: `${serverEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`
  };
};

export default robots;
