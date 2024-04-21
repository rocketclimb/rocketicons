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

  const pathNameHasApi = pathname.startsWith("/api/");

  const pathIsWebManifest = pathname.endsWith("webmanifest");

  const pathNameIsFont = pathname.startsWith("/fonts/");

  const pathNameIsWellKnown = pathname.startsWith(".well-known");

  if (
    pathnameHasLocale ||
    pathNameHasApi ||
    pathIsWebManifest ||
    pathNameIsFont ||
    pathNameIsWellKnown
  ) {
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
