import { NextRequest, NextResponse } from "next/server";
import { AvailableLanguages, Languages } from "@/types";

import { siteConfig } from "./config/site";

const { defaultLocale, locales } = siteConfig;

const getLocaleFromUrl = ({ nextUrl: { pathname } }: NextRequest): Languages | undefined => {
  const [, segment] = pathname.split("/") as Languages[];
  return AvailableLanguages.includes(segment) ? segment : undefined;
};

const getLocaleFromHeaders = (request: NextRequest): Languages =>
  (
    request.headers
      .get("accept-language")
      ?.split(",")
      .map((language) => language.split(";").shift())
      .find(
        (language) => language && locales.includes(language.toLocaleLowerCase() as Languages)
      ) || defaultLocale
  ).toLowerCase() as Languages;

const handleIconsPage = (locale: Languages, request: NextRequest) => {
  const collectionUrl = `/${locale}/icons/`;
  const { pathname } = request.nextUrl;
  if (pathname.startsWith(collectionUrl)) {
    const [collection, icon] = pathname.replace(collectionUrl, "").split("/");
    if (icon) {
      request.nextUrl.pathname = `${collectionUrl}${collection}`;
      request.nextUrl.searchParams.set("i", icon);
      return NextResponse.rewrite(request.nextUrl);
    }
  }

  return NextResponse.next();
};

export const middleware = (request: NextRequest) => {
  const localeFromUrl = getLocaleFromUrl(request);

  if (localeFromUrl) {
    return handleIconsPage(localeFromUrl, request);
  }

  const localeFromHeaders = getLocaleFromHeaders(request);
  const { pathname } = request.nextUrl;

  request.nextUrl.pathname = `/${localeFromHeaders}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
};

export const config = {
  matcher: [
    "/((?!_next|_vercel|examples|img|favicon|icon-rocketicons|logo|android|apple-touch|mstile|safari-pinned|sitemap|fonts|api|.well-known|site.webmanifest|robots).*)"
  ]
};
