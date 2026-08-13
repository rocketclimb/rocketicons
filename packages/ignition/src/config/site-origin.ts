const DEVELOPMENT_ORIGIN = "http://localhost:3000";

export const normalizeSiteOrigin = (value: string): string => {
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("SITE_ORIGIN must use http or https");
  }
  if (
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("SITE_ORIGIN must be an origin without credentials, path, query, or hash");
  }
  return parsed.origin;
};

export const getSiteOrigin = (): string => {
  const configured = process.env.SITE_ORIGIN;
  if (configured) return normalizeSiteOrigin(configured);
  if (process.env.NODE_ENV === "production") {
    throw new Error("SITE_ORIGIN is required for a production static export");
  }
  return DEVELOPMENT_ORIGIN;
};

export const absoluteSiteUrl = (path = "/") => new URL(path, `${getSiteOrigin()}/`);
