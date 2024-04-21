import { serverEnv } from "@/env/server";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${serverEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
