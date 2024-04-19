import { NextRequest, NextResponse } from "next/server";

import { siteConfig } from "./config/site";
const { defaultLocale } = siteConfig;

const getLocale = (request: NextRequest): string =>
  (
    request.headers
      .get("accept-language")
      ?.split(",")
      .map((language) => language.split(";").shift())
      .find(
        (language) =>
          language && siteConfig.locales.includes(language.toLocaleLowerCase())
      ) || defaultLocale
  ).toLowerCase();

export const middleware = (request: NextRequest) => {
  const locale = getLocale(request);
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = siteConfig.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const pathNameHasApi = pathname.startsWith("/api/");

  const pathIsWebManifest = pathname.endsWith("webmanifest");

  if (pathnameHasLocale || pathNameHasApi || pathIsWebManifest) {
    return NextResponse.next();
  }

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
};

export const config = {
  matcher: [
    "/((?!_next|examples|img|favicon|icon|logo|android|apple-touch|mstile|safari-pinned).*)",
  ],
};
