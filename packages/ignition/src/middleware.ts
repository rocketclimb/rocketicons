import { NextRequest, NextResponse } from "next/server";
import { Languages } from "@/types";

import { siteConfig } from "./config/site";

const { defaultLocale, locales } = siteConfig;

const getLocale = (request: NextRequest): string =>
  (
    request.headers
      .get("accept-language")
      ?.split(",")
      .map((language) => language.split(";").shift())
      .find(
        (language) =>
          language &&
          locales.includes(language.toLocaleLowerCase() as Languages)
      ) || defaultLocale
  ).toLowerCase();

export const middleware = (request: NextRequest) => {
  const locale = getLocale(request);
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
};

export const config = {
  matcher: [
    "/((?!_next|_vercel|examples|img|favicon|icon-rocketicons|logo|android|apple-touch|mstile|safari-pinned|sitemap|fonts|api|.well-known|site.webmanifest|robots).*)",
  ],
};
