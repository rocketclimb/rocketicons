import { NextRequest, NextResponse } from "next/server";

import { siteConfig } from "./config/site";
const { defaultLocale, locales } = siteConfig;

const getLocale = (request: NextRequest): string =>
  (
    request.headers
      .get("accept-language")
      ?.split(",")
      .map((language) => language.split(";").shift())
      .find(
        (language) => language && locales.includes(language.toLocaleLowerCase())
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
    "/((?!_next|examples|img|favicon|logo|android|apple-touch|mstile|safari-pinned|sitemap|fonts|api|.well-known|site.webmanifest).*)",
  ],
};
