import { NextRequest, NextResponse } from "next/server";
import { AvailableLanguages, Languages } from "@/types";
import getLocaleFromHeaders from "@/locales/get-locale-from-headers";

const getLocaleFromUrl = ({ nextUrl: { pathname } }: NextRequest): Languages | undefined => {
  const [, segment] = pathname.split("/") as Languages[];
  return AvailableLanguages.includes(segment) ? segment : undefined;
};

const handleIconsPage = (locale: Languages, request: NextRequest) => {
  const collectionUrl = `/${locale}/icons/`;
  const { pathname } = request.nextUrl;
  if (pathname.startsWith(collectionUrl)) {
    const [collection, icon] = pathname.replace(collectionUrl, "").split("/");
    if (!icon) {
      request.nextUrl.pathname = `${collectionUrl}${collection}/collection-index.ri`;
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

  const localeFromHeaders = getLocaleFromHeaders(request.headers);
  const { pathname } = request.nextUrl;

  request.nextUrl.pathname = `/${localeFromHeaders}${pathname}`;
  return NextResponse.redirect(request.nextUrl, { status: 302 });
};

export const config = {
  matcher: [
    "/((?!_next|_vercel|examples|img|favicon|icon-rocketicons|logo|android|apple-touch|mstile|safari-pinned|sitemap|fonts|api|.well-known|site.webmanifest|robots).*)"
  ]
};
