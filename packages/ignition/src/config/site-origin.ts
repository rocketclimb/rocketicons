const DEVELOPMENT_ORIGIN = "http://localhost:3000";

export const normalizeSiteOrigin = (value: string): string => {
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("SITE_ORIGIN must use http or https");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("SITE_ORIGIN must not contain credentials, a query, or a hash");
  }
  const basePath = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${basePath}`;
};

export const getSiteOrigin = (): string => {
  const configured = process.env.SITE_ORIGIN;
  if (configured) return normalizeSiteOrigin(configured);
  if (process.env.NODE_ENV === "production") {
    throw new Error("SITE_ORIGIN is required for a production static export");
  }
  return DEVELOPMENT_ORIGIN;
};

export const getSiteBasePath = (): string =>
  new URL(getSiteOrigin()).pathname.replace(/\/+$/, "");

export const withSiteBasePath = (path = "/"): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteBasePath()}${normalizedPath}`;
};

export const absoluteSiteUrl = (path = "/") => {
  const site = new URL(getSiteOrigin());
  return new URL(withSiteBasePath(path), site.origin);
};

/**
 * Origin for open graph images only.
 *
 * Preview deployments build with the production SITE_ORIGIN on purpose, so canonical and
 * hreflang keep pointing at production — that is what keeps preview domains out of the index.
 * The side effect is that a preview would advertise image paths that only exist once the PR
 * ships. OG_IMAGE_ORIGIN lets the deployment override the image origin alone, leaving every
 * other URL untouched.
 */
export const getOgImageOrigin = (): string => {
  const configured = process.env.OG_IMAGE_ORIGIN;
  return configured ? normalizeSiteOrigin(configured) : getSiteOrigin();
};

export const absoluteOgImageUrl = (path = "/") => {
  const origin = new URL(getOgImageOrigin());
  const basePath = origin.pathname.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${basePath}${normalizedPath}`, origin.origin);
};
