import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "pt-br"];
const defaultLocale = "en";

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

  // const pathNameIsOpenGraphImage = pathname.startsWith("/opengraph-image");

  // const pathNameIsFavicon = pathname.startsWith("/favicon");

  // console.log(
  //   pathname,
  //   pathNameIsOpenGraphImage,
  //   pathNameIsFavicon,
  //   pathnameHasLocale
  // );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  request.nextUrl.pathname = `/${locale}${pathname}`;
  const isDefaultLocale = locale === defaultLocale;

  return isDefaultLocale
    ? NextResponse.rewrite(request.nextUrl)
    : NextResponse.redirect(request.nextUrl);
};

export const config = {
  matcher: [
    "/((?!_next|img|favicon|icon|logo|android|apple-touch|mstile|safari-pinned).*)",
  ],
};
