import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { NextRequest } from "next/server";

// returns a web.manifest json file
export const GET = async (request: NextRequest) => {
  const { name } = siteConfig;

  return new Response(
    `{
      "name": "${name}",
      "short_name": "${name}",
      "icons": [
        {
          "src": "/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/android-chrome-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "theme_color": "#ffffff",
      "background_color": "#ffffff",
      "start_url": "${serverEnv.NEXT_PUBLIC_APP_URL}",
      "display": "standalone"
    }`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
